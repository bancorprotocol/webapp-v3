import { bancorNetwork$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { web3, writeWeb3 } from 'services/web3';
import {
  bntToken,
  changeGas,
  ethToken,
  wethToken,
  zeroAddress,
} from 'services/web3/config';
import { take } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { apiData$ } from 'services/observables/pools';
import { APIPool } from 'services/api/bancor';
import { currentNetwork$ } from 'services/observables/network';
import {
  sendConversionEvent,
  ConversionEvents,
} from 'services/api/googleTagManager';
import { calcReserve, expandToken, shrinkToken } from 'utils/formulas';
import { getConversionLS } from 'utils/localStorage';
import { ppmToDec } from 'utils/helperFunctions';
import { BancorNetwork__factory, Converter__factory } from '../abis/types';
import { MultiCall as MCInterface, multicall } from '../multicall/multicall';
import { ErrorCode } from '../types';

export const getRateAndPriceImapct = async (
  fromToken: Token,
  toToken: Token,
  amount: string
) => {
  try {
    const networkContractAddress = await bancorNetwork$
      .pipe(take(1))
      .toPromise();

    const contract = BancorNetwork__factory.connect(
      networkContractAddress,
      web3.provider
    );

    const from =
      fromToken.address === wethToken
        ? { ...fromToken, address: ethToken }
        : fromToken;
    const to =
      toToken.address === wethToken
        ? { ...toToken, address: ethToken }
        : toToken;

    const path = await contract.conversionPath(from.address, to.address);

    const fromAmountWei = expandToken(amount, fromToken.decimals);
    const rateShape: MCInterface = {
      contractAddress: contract.address,
      interface: contract.interface,
      methodName: 'rateByPath',
      methodParameters: [path, fromAmountWei],
    };

    const spotRate = await calculateSpotPriceAndRate(fromToken, to, rateShape);
    const rate = shrinkToken(spotRate.rate, toToken.decimals);

    const priceImpactNum = new BigNumber(1)
      .minus(new BigNumber(rate).div(amount).div(spotRate.spotPrice))
      .times(100);

    return {
      rate,
      priceImpact: isNaN(priceImpactNum.toNumber())
        ? '0.0000'
        : priceImpactNum.toFixed(4),
    };
  } catch (error) {
    console.error('Failed fetching rate and price impact: ', error);
    return { rate: '0', priceImpact: '0.0000' };
  }
};

export const getRate = async (
  fromToken: Token,
  toToken: Token,
  amount: string
) => {
  try {
    const networkContractAddress = await bancorNetwork$
      .pipe(take(1))
      .toPromise();

    const contract = BancorNetwork__factory.connect(
      networkContractAddress,
      web3.provider
    );

    const from = fromToken.address === wethToken ? ethToken : fromToken.address;
    const to = toToken.address === wethToken ? ethToken : toToken.address;

    const path = await contract.conversionPath(from, to);

    const fromAmountWei = expandToken(amount, fromToken.decimals);
    const toAmountWei = await contract.rateByPath(path, fromAmountWei);
    return shrinkToken(toAmountWei.toString(), toToken.decimals);
  } catch (error) {
    console.error('Failed fetching rate', error);
    return { rate: '0', priceImpact: '0.0000' };
  }
};

const calculateMinimumReturn = (
  expectedWei: string,
  slippageTolerance: number
): string => {
  const res = new BigNumber(expectedWei)
    .times(new BigNumber(1).minus(slippageTolerance))
    .toFixed(0);

  return res === '0' ? '1' : res;
};

export const swap = async (
  slippageTolerance: number,
  fromToken: Token,
  toToken: Token,
  fromAmount: string,
  toAmount: string,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: (error: string) => void
) => {
  try {
    const fromIsEth = fromToken.address === ethToken;
    const networkContractAddress = await bancorNetwork$
      .pipe(take(1))
      .toPromise();

    const contract = BancorNetwork__factory.connect(
      networkContractAddress,
      writeWeb3.signer
    );

    const fromWei = expandToken(fromAmount, fromToken.decimals);
    const expectedToWei = expandToken(toAmount, toToken.decimals);
    const path = await findPath(fromToken.address, toToken.address);

    const conversion = getConversionLS();
    sendConversionEvent(ConversionEvents.wallet_req, conversion);

    const estimate = await contract.estimateGas.convertByPath(
      path,
      fromWei,
      calculateMinimumReturn(expectedToWei, slippageTolerance),
      zeroAddress,
      zeroAddress,
      0,
      { value: fromIsEth ? fromWei : undefined }
    );
    const gasLimit = changeGas(estimate.toString());

    const tx = await contract.convertByPath(
      path,
      fromWei,
      calculateMinimumReturn(expectedToWei, slippageTolerance),
      zeroAddress,
      zeroAddress,
      0,
      { value: fromIsEth ? fromWei : undefined, gasLimit }
    );

    sendConversionEvent(ConversionEvents.wallet_confirm, conversion);

    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    console.error('Swap failed with error: ', e);

    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

const findPath = async (from: string, to: string) => {
  const network = await currentNetwork$.pipe(take(1)).toPromise();
  if (from === bntToken(network))
    return [from, (await findPoolByToken(to)).pool_dlt_id, to];

  if (to === bntToken(network))
    return [from, (await findPoolByToken(from)).pool_dlt_id, to];

  return [
    from,
    (await findPoolByToken(from)).pool_dlt_id,
    bntToken(network),
    (await findPoolByToken(to)).pool_dlt_id,
    to,
  ];
};

const calculateSpotPriceAndRate = async (
  from: Token,
  to: Token,
  rateShape: MCInterface
) => {
  const network = await currentNetwork$.pipe(take(1)).toPromise();

  const bnt = bntToken(network);
  let pool;
  if (from.address === bnt) pool = await findPoolByToken(to.address);
  if (to.address === bnt) pool = await findPoolByToken(from.address);

  if (pool) {
    const fromShape = buildTokenPoolCall(pool.converter_dlt_id, from.address);
    const toShape = buildTokenPoolCall(pool.converter_dlt_id, to.address);

    const mCall = [fromShape, toShape, rateShape];
    const res = await multicall(mCall);

    if (res && res.length === mCall.length) {
      return {
        spotPrice: calcReserve(
          shrinkToken(res[0].toString(), from.decimals),
          shrinkToken(res[1].toString(), to.decimals),
          ppmToDec(pool.fee)
        ),
        rate: res[2].toString(),
      };
    }
  }

  //First hop
  const fromPool = await findPoolByToken(from.address);
  const fromShape1 = buildTokenPoolCall(
    fromPool.converter_dlt_id,
    from.address
  );
  const bntShape1 = buildTokenPoolCall(fromPool.converter_dlt_id, bnt);

  //Second hop
  const toPool = await findPoolByToken(to.address);
  const bntShape2 = buildTokenPoolCall(toPool.converter_dlt_id, bnt);
  const toShape2 = buildTokenPoolCall(toPool.converter_dlt_id, to.address);

  const mCall = [fromShape1, bntShape1, bntShape2, toShape2, rateShape];
  const res = await multicall(mCall);

  if (res && res.length === mCall.length) {
    const spot1 = calcReserve(
      shrinkToken(res[0].toString(), from.decimals),
      shrinkToken(res[1].toString(), 18),
      ppmToDec(fromPool.fee)
    );

    const spot2 = calcReserve(
      shrinkToken(res[2].toString(), 18),
      shrinkToken(res[3].toString(), to.decimals),
      ppmToDec(toPool.fee)
    );

    return { spotPrice: spot1.times(spot2), rate: res[4].toString() };
  }

  return { rate: '0', spotPrice: new BigNumber(0) };
};

export const buildTokenPoolCall = (
  contractAddress: string,
  tokenAddress: string
): MCInterface => {
  const contract = Converter__factory.connect(contractAddress, web3.provider);

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'getConnectorBalance',
    methodParameters: [tokenAddress],
  };
};

const findPoolByToken = async (tkn: string): Promise<APIPool> => {
  const apiData = await apiData$.pipe(take(1)).toPromise();

  const pool = apiData.pools.find(
    (x) => x && x.reserves.find((x) => x.address === tkn)
  );
  if (pool) return pool;

  throw new Error('No pool found');
};

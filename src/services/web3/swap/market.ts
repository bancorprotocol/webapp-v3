import { bancorNetwork$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { resolveTxOnConfirmation } from 'services/web3';
import { web3, writeWeb3 } from 'services/web3';
import {
  bntToken,
  ethToken,
  wethToken,
  zeroAddress,
} from 'services/web3/config';
import { take } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { apiData$ } from 'services/observables/pools';
import { Pool } from 'services/api/bancor';
import { currentNetwork$ } from 'services/observables/network';
import {
  sendConversionEvent,
  ConversionEvents,
} from 'services/api/googleTagManager';
import { calcReserve, expandToken, shrinkToken } from 'utils/formulas';
import { getConversionLS } from 'utils/localStorage';
import { ppmToDec } from 'utils/helperFunctions';
import {
  BancorNetwork,
  BancorNetwork__factory,
  Converter__factory,
} from '../abis/types';
import { multicall } from '../multicall/multicall';

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
      web3
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
    const rateShape = {
      contractAddress: contract.address,
      interface: contract.interface,
      methodName: contract.rateByPath.toString(),
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
      web3
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

export const swap = async ({
  slippageTolerance,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  user,
  onConfirmation,
}: {
  slippageTolerance: number;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  user: string;
  onConfirmation?: Function;
}): Promise<string> => {
  const fromIsEth = fromToken.address === ethToken;
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const contract = BancorNetwork__factory.connect(
    networkContractAddress,
    writeWeb3
  );

  const fromWei = expandToken(fromAmount, fromToken.decimals);
  const expectedToWei = expandToken(toAmount, toToken.decimals);
  const path = await findPath(fromToken.address, toToken.address);

  const conversion = getConversionLS();
  sendConversionEvent(ConversionEvents.wallet_req, conversion);

  return resolveTxOnConfirmation({
    tx: await contract.convertByPath(
      path,
      fromWei,
      calculateMinimumReturn(expectedToWei, slippageTolerance),
      zeroAddress,
      zeroAddress,
      0
    ),
    user,
    onHash: () =>
      sendConversionEvent(ConversionEvents.wallet_confirm, conversion),
    onConfirmation: () => {
      sendConversionEvent(ConversionEvents.success, {
        ...conversion,
        conversion_market_token_rate: fromToken.usdPrice,
        transaction_category: 'Conversion',
      });
      onConfirmation && onConfirmation();
    },
    resolveImmediately: true,
    ...(fromIsEth && { value: fromWei }),
  });
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
  rateShape: any
) => {
  const network = await currentNetwork$.pipe(take(1)).toPromise();

  const bnt = bntToken(network);
  let pool;
  if (from.address === bnt) pool = await findPoolByToken(to.address);
  if (to.address === bnt) pool = await findPoolByToken(from.address);

  if (pool) {
    const fromShape = buildTokenPoolCall(pool, from.address);
    const toShape = buildTokenPoolCall(pool, to.address);

    const [fromReserve, toReserve, rate]: any = await multicall(network, [
      fromShape,
      toShape,
      rateShape,
    ]);

    return {
      spotPrice: calcReserve(
        shrinkToken(fromReserve[0].balance, from.decimals),
        shrinkToken(toReserve[0].balance, to.decimals),
        ppmToDec(pool.fee)
      ),
      rate: rate[0].rate,
    };
  }

  //First hop
  const fromPool = await findPoolByToken(from.address);
  const fromShape1 = buildTokenPoolCall(fromPool, from.address);
  const bntShape1 = buildTokenPoolCall(fromPool, bnt);

  //Second hop
  const toPool = await findPoolByToken(to.address);
  const bntShape2 = buildTokenPoolCall(toPool, bnt);
  const toShape2 = buildTokenPoolCall(toPool, to.address);

  const [fromReserve1, bntReserve1, bntReserve2, toReserve2, rate]: any =
    await multicall(network, [
      fromShape1,
      bntShape1,
      bntShape2,
      toShape2,
      rateShape,
    ]);

  const spot1 = calcReserve(
    shrinkToken(fromReserve1[0].balance, from.decimals),
    shrinkToken(bntReserve1[0].balance, 18),
    ppmToDec(fromPool.fee)
  );

  const spot2 = calcReserve(
    shrinkToken(bntReserve2[0].balance, 18),
    shrinkToken(toReserve2[0].balance, to.decimals),
    ppmToDec(toPool.fee)
  );

  return { spotPrice: spot1.times(spot2), rate: rate[0].rate };
};

const buildTokenPoolCall = (pool: Pool, tokenAddress: string) => {
  const contract = Converter__factory.connect(pool.converter_dlt_id, web3);

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: contract.getConnectorBalance.toString(),
    methodParameters: [tokenAddress],
  };
};

const findPoolByToken = async (tkn: string): Promise<Pool> => {
  const apiData = await apiData$.pipe(take(1)).toPromise();

  const pool = apiData.pools.find(
    (x) => x && x.reserves.find((x) => x.address === tkn)
  );
  if (pool) return pool;

  throw new Error('No pool found');
};

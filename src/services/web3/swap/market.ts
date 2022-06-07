import { bancorNetwork$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { web3, writeWeb3 } from 'services/web3';
import {
  bntDecimals,
  bntToken,
  changeGas,
  ethToken,
  wethToken,
  zeroAddress,
} from 'services/web3/config';
import { take } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import {
  ConversionEvents,
  sendConversionEvent,
} from 'services/api/googleTagManager';
import { calcReserve, expandToken, shrinkToken } from 'utils/formulas';
import { getFutureTime, ppmToDec } from 'utils/helperFunctions';
import { BancorNetwork__factory, Converter__factory } from '../abis/types';
import { MultiCall as MCInterface, multicall } from '../multicall/multicall';
import { ErrorCode } from '../types';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import dayjs from 'utils/dayjs';
import { apiData$, apiPoolsV3$ } from 'services/observables/apiData';

export const getRateAndPriceImapct = async (
  fromToken: Token,
  toToken: Token,
  amount: string,
  forceV3Routing: boolean
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

    const v2SpotRate = await calculateSpotPriceAndRate(
      fromToken,
      to,
      rateShape
    );
    const v2Rate = shrinkToken(v2SpotRate.rate, toToken.decimals);
    const v2PI = new BigNumber(1)
      .minus(new BigNumber(v2Rate).div(amount).div(v2SpotRate.spotPrice))
      .times(100);
    const v2PriceImpact = isNaN(v2PI.toNumber()) ? '0.0000' : v2PI.toFixed(4);

    const tradingEnabled = await v3PoolTradingEnabled(fromToken.address);
    const v3Rate = tradingEnabled
      ? await getV3Rate(fromToken, toToken, amount)
      : '0';
    const v3PI = tradingEnabled
      ? await getV3PriceImpact(fromToken, toToken, amount, v3Rate)
      : new BigNumber(0);
    const v3PriceImpact = isNaN(v3PI.toNumber()) ? '0.0000' : v3PI.toFixed(4);

    const isV3 =
      (v3Rate !== '0' && forceV3Routing) || Number(v3Rate) >= Number(v2Rate);

    console.log('V2 Rate', v2Rate);
    console.log('V3 Rate', v3Rate);

    return {
      rate: isV3 ? v3Rate : v2Rate,
      priceImpact: isV3 ? v3PriceImpact : v2PriceImpact,
      isV3,
    };
  } catch (error) {
    console.error('Failed fetching rate and price impact: ', error);
    return { rate: '0', priceImpact: '0.0000', isV3: false };
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

export const calculateMinimumReturn = (
  expectedWei: string,
  slippageTolerance: number
): string => {
  const res = new BigNumber(expectedWei)
    .times(new BigNumber(1).minus(slippageTolerance))
    .toFixed(0);

  return res === '0' ? '1' : res;
};

export const swap = async (
  isV3: boolean,
  user: string,
  slippageTolerance: number,
  fromToken: Token,
  toToken: Token,
  fromAmount: string,
  toAmount: string,
  onHash: (txHash: string) => void,
  onCompleted: (txHash: string) => void,
  rejected: Function,
  failed: (error: string) => void
) => {
  try {
    sendConversionEvent(ConversionEvents.wallet_req);

    const tx = await executeSwapTx(
      isV3,
      user,
      slippageTolerance,
      fromToken,
      toToken,
      fromAmount,
      toAmount
    );

    sendConversionEvent(ConversionEvents.wallet_confirm, tx.hash);

    onHash(tx.hash);
    await tx.wait();
    onCompleted(tx.hash);
  } catch (e: any) {
    console.error('Swap failed with error: ', e);

    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

export const executeSwapTx = async (
  isV3: boolean,
  user: string,
  slippageTolerance: number,
  fromToken: Token,
  toToken: Token,
  fromAmount: string,
  toAmount: string
) => {
  const fromIsEth = fromToken.address === ethToken;
  const fromWei = expandToken(fromAmount, fromToken.decimals);
  const expectedToWei = expandToken(toAmount, toToken.decimals);
  const minReturn = calculateMinimumReturn(expectedToWei, slippageTolerance);

  if (isV3) {
    return await ContractsApi.BancorNetwork.write.tradeBySourceAmount(
      fromToken.address,
      toToken.address,
      fromWei,
      minReturn,
      getFutureTime(dayjs.duration({ days: 7 })),
      user,
      { value: fromIsEth ? fromWei : undefined }
    );
  }

  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const contract = BancorNetwork__factory.connect(
    networkContractAddress,
    writeWeb3.signer
  );

  const path = await findPath(fromToken.address, toToken.address);
  if (path.length === 0) throw new Error('No path was found between tokens');

  const estimate = await contract.estimateGas.convertByPath(
    path,
    fromWei,
    minReturn,
    zeroAddress,
    zeroAddress,
    0,
    { value: fromIsEth ? fromWei : undefined }
  );
  const gasLimit = changeGas(estimate.toString());

  return await contract.convertByPath(
    path,
    fromWei,
    minReturn,
    zeroAddress,
    zeroAddress,
    0,
    { value: fromIsEth ? fromWei : undefined, gasLimit }
  );
};

const findPath = async (from: string, to: string) => {
  if (from === bntToken) {
    const pool = await findPoolByToken(to);
    if (!pool) return [];
    return [from, pool.pool_dlt_id, to];
  }

  if (to === bntToken) {
    const pool = await findPoolByToken(from);
    if (!pool) return [];
    return [from, pool.pool_dlt_id, to];
  }

  const fromPool = await findPoolByToken(from);
  const toPool = await findPoolByToken(to);
  if (!(fromPool && toPool)) return [];

  return [from, fromPool.pool_dlt_id, bntToken, toPool.pool_dlt_id, to];
};

const calculateSpotPriceAndRate = async (
  from: Token,
  to: Token,
  rateShape: MCInterface
) => {
  let pool;
  if (from.address === bntToken) pool = await findPoolByToken(to.address);
  if (to.address === bntToken) pool = await findPoolByToken(from.address);

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
  const empty = { rate: '0', spotPrice: new BigNumber(0) };
  //First hop
  const fromPool = await findPoolByToken(from.address);
  if (!fromPool) return empty;

  const fromShape1 = buildTokenPoolCall(
    fromPool.converter_dlt_id,
    from.address
  );
  const bntShape1 = buildTokenPoolCall(fromPool.converter_dlt_id, bntToken);

  //Second hop
  const toPool = await findPoolByToken(to.address);
  if (!toPool) return empty;

  const bntShape2 = buildTokenPoolCall(toPool.converter_dlt_id, bntToken);
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

  return empty;
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

const findPoolByToken = async (tkn: string) => {
  const apiData = await apiData$.pipe(take(1)).toPromise();

  const pool = apiData.pools.find(
    (x) => x && x.reserves.find((x) => x.address === tkn)
  );
  if (pool) return pool;
};

export const v3PoolTradingEnabled = async (tkn: string) => {
  const pools = await apiPoolsV3$.pipe(take(1)).toPromise();
  const pool = pools.find((pool) => pool.poolDltId === tkn);
  return pool && pool.tradingEnabled;
};

export const getV3Rate = async (
  fromToken: Token,
  toToken: Token,
  amount: string
) => {
  try {
    const res =
      await ContractsApi.BancorNetworkInfo.read.tradeOutputBySourceAmount(
        fromToken.address,
        toToken.address,
        expandToken(amount, fromToken.decimals)
      );
    return shrinkToken(res.toString(), fromToken.decimals);
  } catch (error) {
    return '0';
  }
};

export const getV3RateInverse = async (
  fromToken: Token,
  toToken: Token,
  amount: string
) => {
  try {
    const res =
      await ContractsApi.BancorNetworkInfo.read.tradeInputByTargetAmount(
        fromToken.address,
        toToken.address,
        expandToken(amount, fromToken.decimals)
      );
    return shrinkToken(res.toString(), fromToken.decimals);
  } catch (error) {
    return '0';
  }
};

export const getV3PriceImpact = async (
  fromToken: Token,
  toToken: Token,
  amount: string,
  rate: string
) => {
  try {
    const fromBNT = fromToken.address === bntToken;
    const toBNT = toToken.address === bntToken;

    if (fromBNT || toBNT) {
      const tradingFeePPM =
        await ContractsApi.BancorNetworkInfo.read.tradingFeePPM(
          fromBNT ? toToken.address : fromToken.address
        );
      const tradingLiquidity =
        await ContractsApi.BancorNetworkInfo.read.tradingLiquidity(
          fromBNT ? toToken.address : fromToken.address
        );

      const spotPrice = calcReserve(
        shrinkToken(
          toBNT
            ? tradingLiquidity.baseTokenTradingLiquidity.toString()
            : tradingLiquidity.bntTradingLiquidity.toString(),
          toBNT ? fromToken.decimals : toToken.decimals
        ),
        shrinkToken(
          fromBNT
            ? tradingLiquidity.baseTokenTradingLiquidity.toString()
            : tradingLiquidity.bntTradingLiquidity.toString(),
          fromBNT ? toToken.decimals : fromToken.decimals
        ),
        ppmToDec(tradingFeePPM)
      );

      const priceImpact = new BigNumber(1)
        .minus(new BigNumber(rate).div(amount).div(spotPrice))
        .times(100);

      return priceImpact;
    }

    const fromLiqudity =
      await ContractsApi.BancorNetworkInfo.read.tradingLiquidity(
        fromToken.address
      );
    const toLiqudity =
      await ContractsApi.BancorNetworkInfo.read.tradingLiquidity(
        toToken.address
      );

    const fromTradingFeePPM =
      await ContractsApi.BancorNetworkInfo.read.tradingFeePPM(
        fromToken.address
      );
    const toTradingFeePPM =
      await ContractsApi.BancorNetworkInfo.read.tradingFeePPM(toToken.address);

    const spot1 = calcReserve(
      shrinkToken(
        fromLiqudity.baseTokenTradingLiquidity.toString(),
        fromToken.decimals
      ),
      shrinkToken(fromLiqudity.bntTradingLiquidity.toString(), bntDecimals),
      ppmToDec(fromTradingFeePPM)
    );

    const spot2 = calcReserve(
      shrinkToken(toLiqudity.bntTradingLiquidity.toString(), bntDecimals),
      shrinkToken(
        toLiqudity.baseTokenTradingLiquidity.toString(),
        toToken.decimals
      ),
      ppmToDec(toTradingFeePPM)
    );

    const spotPrice = spot1.times(spot2);

    const priceImpact = new BigNumber(1)
      .minus(new BigNumber(rate).div(amount).div(spotPrice))
      .times(100);

    return priceImpact;
  } catch (error) {
    return new BigNumber(0);
  }
};

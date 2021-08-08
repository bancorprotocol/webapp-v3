import { bancorNetwork$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { expandToken, ppmToDec, shrinkToken } from 'utils/pureFunctions';
import { resolveTxOnConfirmation } from 'services/web3';
import { web3, writeWeb3 } from 'services/web3/contracts';
import {
  bntToken,
  ethToken,
  wethToken,
  zeroAddress,
} from 'services/web3/config';
import {
  buildNetworkContract,
  conversionPath,
  getRateByPath,
} from 'services/web3/contracts/network/wrapper';
import { take } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { apiData$ } from 'services/observables/pools';
import { Pool } from 'services/api/bancor';
import { currentNetwork$ } from 'services/observables/network';
import {
  sendConversionEvent,
  ConversionEvents,
} from 'services/api/googleTagManager';
import { fetchBalances } from 'services/observables/balances';
import wait from 'waait';
import {
  buildPoolBalanceShape,
  buildRateShape,
  multi,
} from '../contracts/shapes';
import { calcReserve } from 'utils/formulas';
import { getConversionLS } from 'utils/localStorage';

export const getRateAndPriceImapct = async (
  fromToken: Token,
  toToken: Token,
  amount: string
) => {
  try {
    const networkContractAddress = await bancorNetwork$
      .pipe(take(1))
      .toPromise();

    const from =
      fromToken.address === wethToken
        ? { ...fromToken, address: ethToken }
        : fromToken;
    const to =
      toToken.address === wethToken
        ? { ...toToken, address: ethToken }
        : toToken;

    const path = await conversionPath({
      from: from.address,
      to: to.address,
      networkContractAddress,
      web3,
    });
    const fromAmountWei = expandToken(amount, fromToken.decimals);
    const rateShape = await buildRateShape({
      networkContractAddress,
      amount: fromAmountWei,
      path,
      web3,
    });

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

    const from = fromToken.address === wethToken ? ethToken : fromToken.address;
    const to = toToken.address === wethToken ? ethToken : toToken.address;

    const path = await conversionPath({
      from,
      to,
      networkContractAddress,
      web3,
    });

    const fromAmountWei = expandToken(amount, fromToken.decimals);
    const toAmountWei = await getRateByPath({
      networkContractAddress,
      amount: fromAmountWei,
      path,
      web3,
    });
    return shrinkToken(toAmountWei, toToken.decimals);
  } catch (error) {
    console.error('Failed fetching rate and price impact: ', error);
    return { rate: '0', priceImpact: '0.0000' };
  }
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

  const networkContract = buildNetworkContract(
    networkContractAddress,
    writeWeb3
  );

  const fromWei = expandToken(fromAmount, fromToken.decimals);
  const expectedToWei = expandToken(toAmount, toToken.decimals);
  const path = await findPath(fromToken.address, toToken.address);

  const conversion = getConversionLS();
  sendConversionEvent(ConversionEvents.wallet_req, conversion);

  return resolveTxOnConfirmation({
    tx: networkContract.methods.convertByPath(
      path,
      fromWei,
      new BigNumber(expectedToWei)
        .times(new BigNumber(1).minus(slippageTolerance))
        .toFixed(0),
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
      //RefreshBalances
      fetchBalances([fromToken.address, toToken.address, ethToken]);
      wait(4000).then(() =>
        fetchBalances([fromToken.address, toToken.address, ethToken])
      );
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
    const fromShape = buildTokenPoolShape(pool, from.address);
    const toShape = buildTokenPoolShape(pool, to.address);

    const [fromReserve, toReserve, rate]: any = await multi({
      groupsOfShapes: [[fromShape], [toShape], [rateShape]],
      currentNetwork: network,
    });

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
  const fromShape1 = buildTokenPoolShape(fromPool, from.address);
  const bntShape1 = buildTokenPoolShape(fromPool, bnt);

  //Second hop
  const toPool = await findPoolByToken(to.address);
  const bntShape2 = buildTokenPoolShape(toPool, bnt);
  const toShape2 = buildTokenPoolShape(toPool, to.address);

  const [fromReserve1, bntReserve1, bntReserve2, toReserve2, rate]: any =
    await multi({
      groupsOfShapes: [
        [fromShape1],
        [bntShape1],
        [bntShape2],
        [toShape2],
        [rateShape],
      ],
      currentNetwork: network,
    });

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

const buildTokenPoolShape = (pool: Pool, tokenAddress: string) => {
  return buildPoolBalanceShape({
    web3,
    tokenAddress,
    converterAddress: pool.converter_dlt_id,
  });
};

const findPoolByToken = async (tkn: string): Promise<Pool> => {
  const apiData = await apiData$.pipe(take(1)).toPromise();

  const pool = apiData.welcomeData.pools.find(
    (x) => x && x.reserves.find((x) => x.address === tkn)
  );
  if (pool) return pool;

  throw new Error('No pool found');
};

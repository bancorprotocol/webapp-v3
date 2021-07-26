import { bancorNetwork$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { expandToken, shrinkToken, splitArrayByVal } from 'utils/pureFunctions';
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

const oneMillion = new BigNumber(1000000);

export const getRateAndPriceImapct = async (
  fromToken: Token,
  toToken: Token,
  amount: string,
  skipPriceImpact?: boolean
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
    const rate = shrinkToken(toAmountWei, toToken.decimals);

    if (skipPriceImpact) return { rate, priceImpact: '0.0000' };

    const priceImpactNum = new BigNumber(1)
      .minus(
        new BigNumber(rate).div(amount).div(await calculateSpotPrice(from, to))
      )
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
  onConfirmation: Function;
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
    onConfirmation: () => {
      //RefreshBalances
      onConfirmation();
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

const calculateSpotPrice = async (from: string, to: string) => {
  const network = await currentNetwork$.pipe(take(1)).toPromise();

  let pool;
  if (from === bntToken(network)) pool = await findPoolByToken(to);
  if (to === bntToken(network)) pool = await findPoolByToken(from);

  if (pool) {
    const [fromReserve, toReserve] = splitArrayByVal(
      pool.reserves,
      (x) => x.address === from
    );
    return new BigNumber(toReserve[0].balance).div(
      new BigNumber(fromReserve[0].balance).times(
        new BigNumber(1).minus(ppmToDec(pool.fee))
      )
    );
  }

  //First hop
  const fromPool = await findPoolByToken(from);
  const [fromReserve1, toReserve1] = splitArrayByVal(
    fromPool.reserves,
    (x) => x.address === from
  );

  //Second hop
  const toPool = await findPoolByToken(to);
  const [fromReserve2, toReserve2] = splitArrayByVal(
    toPool.reserves,
    (x) => x.address !== to
  );

  const spot1 = new BigNumber(toReserve1[0].balance)
    .div(new BigNumber(fromReserve1[0].balance))
    .times(new BigNumber(1).minus(ppmToDec(fromPool.fee)));

  const spot2 = new BigNumber(toReserve2[0].balance).div(
    new BigNumber(fromReserve2[0].balance).times(
      new BigNumber(1).minus(ppmToDec(toPool.fee))
    )
  );

  return spot1.times(spot2);
};

const ppmToDec = (ppm: string) => new BigNumber(ppm).div(oneMillion);

const findPoolByToken = async (tkn: string): Promise<Pool> => {
  const apiData = await apiData$.pipe(take(1)).toPromise();

  const pool = apiData.pools.find(
    (x) => x && x.reserves.find((x) => x.address === tkn)
  );
  if (pool) return pool;

  throw new Error('No pool found');
};

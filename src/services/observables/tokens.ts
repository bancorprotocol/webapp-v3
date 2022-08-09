import { BehaviorSubject, combineLatest, from } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { user$ } from 'services/observables/user';
import {
  fetchETH,
  fetchTokenBalanceMulticall,
} from 'services/web3/token/token';
import { bntToken, ethToken, genericToken } from 'services/web3/config';
import { calculatePercentageChange, shrinkToken } from 'utils/formulas';
import { get7DaysAgo } from 'utils/pureFunctions';
import { UTCTimestamp } from 'lightweight-charts';
import { tokenListTokens$ } from 'services/observables/tokenLists';
import {
  apiPools$,
  apiPoolsV3$,
  apiTokens$,
  apiTokensV3$,
} from 'services/observables/apiData';
import { utils } from 'ethers';
import { fetchKeeperDaoTokens } from 'services/api/keeperDao';
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators';
import { isEqual, uniqueId } from 'lodash';
import BigNumber from 'bignumber.js';
import { settingsContractAddress$ } from 'services/observables/contracts';
import { LiquidityProtectionSettings__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import {
  APIPool,
  APIPoolV3,
  APIToken,
  APITokenV3,
} from 'services/api/bancorApi/bancorApi.types';
import { oneMinute$ } from 'services/observables/timers';
import { toBigNumber } from 'utils/helperFunctions';

export interface TokenMinimal {
  address: string;
  decimals: number;
  logoURI?: string;
  name?: string;
  symbol: string;
  balance?: string;
  balanceUsd?: number;
  usdPrice?: string;
}

export interface Token extends TokenMinimal {
  name: string;
  logoURI: string;
  usdPrice: string;
  liquidity: string;
  usd_24h_ago: string;
  price_change_24: number;
  price_history_7d: { time: UTCTimestamp; value: number }[];
  usd_volume_24: string;
  isProtected: boolean;
  balanceUsd?: number;
}

export interface TokenList {
  id: string;
  name: string;
  logoURI?: string;
  tokens: TokenMinimal[];
}

export const buildTokenObject = (
  apiToken: APIToken,
  apiPools: APIPool[],
  minMintingBalance: string,
  balances?: Map<string, string>,
  tlToken?: TokenMinimal
): Token => {
  const pool = apiPools.find((p) =>
    p.reserves.find((r) => r.address === apiToken.dlt_id)
  );

  // Set balance; if user is NOT logged in set null
  const balance = balances
    ? utils
        .formatUnits(balances.get(apiToken.dlt_id) ?? '0', apiToken.decimals)
        .toString()
    : undefined;

  const balanceUsd = balance
    ? toBigNumber(balance || 0)
        .times(apiToken.rate.usd || 0)
        .toNumber()
    : undefined;

  // Get fallback token and set image and name
  const logoURI = tlToken?.logoURI ?? genericToken;
  const name = tlToken?.name ?? apiToken.symbol;

  const price_change_24 =
    calculatePercentageChange(
      Number(apiToken.rate.usd),
      Number(apiToken.rate_24h_ago.usd)
    ) || 0;

  const seven_days_ago = get7DaysAgo().getUTCSeconds();
  const price_history_7d = apiToken.rates_7d
    .filter((x) => !!x)
    .map((x, i) => ({
      value: Number(x),
      time: (seven_days_ago + i * 360) as UTCTimestamp,
    }));

  const usd_volume_24 = pool ? pool.volume_24h.usd : null;
  const bntReserve = pool
    ? pool.reserves.find((r) => r.address === bntToken)
    : 0;
  const sufficientMintingBalance = new BigNumber(minMintingBalance).lt(
    bntReserve ? bntReserve.balance : 0
  );
  const isWhitelisted = pool ? pool.isWhitelisted : false;
  const isProtected = sufficientMintingBalance && isWhitelisted;

  return {
    name,
    logoURI,
    balance,
    balanceUsd,
    address: apiToken.dlt_id,
    decimals: apiToken.decimals,
    symbol: apiToken.symbol,
    liquidity: apiToken.liquidity.usd ?? '0',
    usdPrice: apiToken.rate.usd ?? '0',
    usd_24h_ago: apiToken.rate_24h_ago.usd ?? '0',
    price_change_24,
    price_history_7d,
    usd_volume_24: usd_volume_24 ?? '0',
    isProtected,
  };
};

export const buildTokenObjectV3 = (
  apiToken: APITokenV3,
  pool: APIPoolV3,
  balances?: Map<string, string>,
  tlToken?: TokenMinimal,
  v2Token?: APIToken
): Token => {
  // Set balance; if user is NOT logged in set null
  const balance = balances
    ? utils
        .formatUnits(balances.get(apiToken.dltId) ?? '0', pool.decimals)
        .toString()
    : undefined;

  const usdPrice = toBigNumber(apiToken.rate.usd).gt(0)
    ? apiToken.rate.usd
    : toBigNumber(v2Token?.rate.usd ?? '0').gt(0)
    ? v2Token?.rate.usd ?? '0'
    : '0';

  const balanceUsd = balance
    ? toBigNumber(balance || 0)
        .times(usdPrice)
        .toNumber()
    : undefined;

  // Get fallback token and set image and name
  const logoURI = tlToken?.logoURI ?? genericToken;
  const name = tlToken?.name ?? apiToken.symbol;

  const price_change_24 =
    calculatePercentageChange(
      Number(apiToken.rate.usd),
      Number(apiToken.rate24hAgo.usd)
    ) || 0;

  const seven_days_ago = get7DaysAgo().getUTCSeconds();
  const price_history_7d = apiToken.rateHistory7d
    .filter((x) => !!x)
    .map((x, i) => ({
      value: Number(x),
      time: (seven_days_ago + i * 360) as UTCTimestamp,
    }));

  const usd_volume_24 = pool ? pool.volume24h.usd : null;

  const usd_24h_ago = toBigNumber(apiToken.rate24hAgo.usd).gt(0)
    ? apiToken.rate24hAgo.usd
    : toBigNumber(v2Token?.rate_24h_ago.usd ?? '0').gt(0)
    ? v2Token?.rate_24h_ago.usd ?? '0'
    : '0';

  return {
    name,
    logoURI,
    balance,
    balanceUsd,
    address: apiToken.dltId,
    decimals: pool.decimals,
    symbol: apiToken.symbol,
    liquidity: pool.tradingLiquidityTKN.usd,
    usdPrice,
    usd_24h_ago,
    price_change_24,
    price_history_7d,
    usd_volume_24: usd_volume_24 ?? '0',
    isProtected: true,
  };
};

const userBalancesReceiver$ = new BehaviorSubject<string>(uniqueId());

export const updateUserBalances = async () => {
  await userBalancesReceiver$.next(uniqueId());
};

export const userBalancesInWei$ = combineLatest([
  apiTokens$,
  user$,
  userBalancesReceiver$,
  oneMinute$,
]).pipe(
  switchMapIgnoreThrow(async ([apiTokens, user]) => {
    if (!user) {
      return undefined;
    }

    // get balances for tokens other than ETH
    const balances = await fetchTokenBalanceMulticall(
      apiTokens.map((t) => t.dlt_id).filter((id) => id !== ethToken),
      user
    );
    // get balance for ETH
    balances.set(ethToken, await fetchETH(user));
    return balances;
  }),
  distinctUntilChanged<Map<string, string> | undefined>(isEqual),
  shareReplay(1)
);

export const userBalancesInWeiV3$ = combineLatest([
  apiTokensV3$,
  user$,
  userBalancesReceiver$,
  oneMinute$,
]).pipe(
  switchMapIgnoreThrow(async ([apiTokensv3, user]) => {
    if (!user) {
      return undefined;
    }

    // get balances for tokens other than ETH
    const balances = await fetchTokenBalanceMulticall(
      apiTokensv3.map((t) => t.dltId).filter((id) => id !== ethToken),
      user
    );
    // get balance for ETH
    balances.set(ethToken, await fetchETH(user));
    return balances;
  }),
  distinctUntilChanged<Map<string, string> | undefined>(isEqual),
  shareReplay(1)
);

const minNetworkTokenLiquidityForMinting$ = combineLatest([
  settingsContractAddress$,
]).pipe(
  switchMap(async ([liquidityProtectionSettingsContract]) => {
    try {
      const contract = LiquidityProtectionSettings__factory.connect(
        liquidityProtectionSettingsContract,
        web3.provider
      );
      const res = await contract.minNetworkTokenLiquidityForMinting();
      return shrinkToken(res.toString(), 18);
    } catch (error) {}

    return '';
  }),
  distinctUntilChanged<string>(isEqual),
  shareReplay(1)
);

export const tokensV2$ = combineLatest([
  apiTokens$,
  apiPools$,
  tokenListTokens$,
  userBalancesInWei$,
  minNetworkTokenLiquidityForMinting$,
]).pipe(
  switchMapIgnoreThrow(
    async ([
      apiTokens,
      apiPools,
      tokenListTokens,
      balances,
      minMintingBalance,
    ]) => {
      const userPreferredTokenListTokensMap = new Map(
        tokenListTokens.userPreferredTokenListTokens.map((t) => [t.address, t])
      );
      return apiTokens
        .map((apiToken) => {
          const tokenListToken = userPreferredTokenListTokensMap.get(
            apiToken.dlt_id
          );
          if (!tokenListToken) {
            return undefined;
          }
          return buildTokenObject(
            apiToken,
            apiPools,
            minMintingBalance,
            balances,
            tokenListToken
          );
        })
        .filter((token) => !!token) as Token[];
    }
  ),
  distinctUntilChanged<Token[]>(isEqual),
  shareReplay(1)
);

export const tokensV3$ = combineLatest([
  apiTokens$,
  apiTokensV3$,
  apiPoolsV3$,
  tokenListTokens$,
  userBalancesInWeiV3$,
]).pipe(
  switchMapIgnoreThrow(
    async ([
      apiTokensV2,
      apiTokensV3,
      apiPoolsV3,
      tokenListTokens,
      balances,
    ]) => {
      const userPreferredTokenListTokensMap = new Map(
        tokenListTokens.userPreferredTokenListTokens.map((t) => [t.address, t])
      );
      const apiPoolsMap = new Map(apiPoolsV3.map((p) => [p.poolDltId, p]));
      const apiTokensV2Map = new Map(apiTokensV2.map((t) => [t.dlt_id, t]));

      return apiTokensV3
        .map((apiToken) => {
          const tokenListToken = userPreferredTokenListTokensMap.get(
            apiToken.dltId
          );
          if (!tokenListToken) {
            return undefined;
          }
          const apiPool = apiPoolsMap.get(apiToken.dltId);
          if (!apiPool) {
            return undefined;
          }
          const v2Token = apiTokensV2Map.get(apiToken.dltId);
          return buildTokenObjectV3(
            apiToken,
            apiPool,
            balances,
            tokenListToken,
            v2Token
          );
        })
        .filter((token) => !!token) as Token[];
    }
  ),
  distinctUntilChanged<Token[]>(isEqual),
  shareReplay(1)
);

export const allTokensNew$ = combineLatest([
  apiTokens$,
  apiPools$,
  tokenListTokens$,
  userBalancesInWei$,
  minNetworkTokenLiquidityForMinting$,
]).pipe(
  switchMapIgnoreThrow(
    async ([
      apiTokens,
      apiPools,
      tokenListTokens,
      balances,
      minMintingBalance,
    ]) => {
      const allTokenListTokensMap = new Map(
        tokenListTokens.allTokenListTokens.map((t) => [t.address, t])
      );
      return apiTokens.map((apiToken) => {
        const tokenListToken = allTokenListTokensMap.get(apiToken.dlt_id);
        return buildTokenObject(
          apiToken,
          apiPools,
          minMintingBalance,
          balances,
          tokenListToken
        );
      });
    }
  ),
  distinctUntilChanged<Token[]>(isEqual),
  shareReplay(1)
);

export const keeperDaoTokens$ = from(fetchKeeperDaoTokens()).pipe(
  shareReplay(1)
);

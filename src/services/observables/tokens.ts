import { BehaviorSubject, combineLatest, from } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { user$ } from 'services/observables/user';
import {
  fetchETH,
  fetchTokenBalanceMulticall,
} from 'services/web3/token/token';
import { bntToken, ethToken, ropstenImage } from 'services/web3/config';
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
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { isEqual, uniqBy, uniqueId } from 'lodash';
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

export interface TokenMinimal {
  address: string;
  decimals: number;
  logoURI?: string;
  name?: string;
  symbol: string;
  balance?: string;
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

  // Get fallback token and set image and name
  const logoURI = tlToken?.logoURI ?? ropstenImage;
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
  tlToken?: TokenMinimal
): Token => {
  // Set balance; if user is NOT logged in set null
  const balance = balances
    ? utils
        .formatUnits(balances.get(apiToken.dltId) ?? '0', pool.decimals)
        .toString()
    : undefined;

  // Get fallback token and set image and name
  const logoURI = tlToken?.logoURI ?? ropstenImage;
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
  return {
    name,
    logoURI,
    balance,
    address: apiToken.dltId,
    decimals: pool.decimals,
    symbol: apiToken.symbol,
    liquidity: pool.tradingLiquidity.usd,
    usdPrice: apiToken.rate.usd,
    usd_24h_ago: apiToken.rate24hAgo.usd,
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
  apiTokensV3$,
  user$,
  userBalancesReceiver$,
]).pipe(
  switchMapIgnoreThrow(async ([apiTokens, apiTokensv3, user]) => {
    if (!user) {
      return undefined;
    }
    const v2Ids = apiTokens.map((t) => t.dlt_id);
    const v3Ids = apiTokensv3.map((t) => t.dltId);
    const ids = uniqBy([...v2Ids, ...v3Ids], (id) => id);

    // get balances for tokens other than ETH
    const balances = await fetchTokenBalanceMulticall(
      ids.filter((id) => id !== ethToken),
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
  switchMapIgnoreThrow(async ([liquidityProtectionSettingsContract]) => {
    const contract = LiquidityProtectionSettings__factory.connect(
      liquidityProtectionSettingsContract,
      web3.provider
    );
    const res = await contract.minNetworkTokenLiquidityForMinting();
    return shrinkToken(res.toString(), 18);
  }),
  distinctUntilChanged<string>(isEqual),
  shareReplay(1)
);

export const tokensNew$ = combineLatest([
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
  apiTokensV3$,
  apiPoolsV3$,
  tokenListTokens$,
  userBalancesInWeiV3$,
]).pipe(
  switchMapIgnoreThrow(
    async ([apiTokens, apiPools, tokenListTokens, balances]) => {
      const userPreferredTokenListTokensMap = new Map(
        tokenListTokens.userPreferredTokenListTokens.map((t) => [t.address, t])
      );
      const apiPoolsMap = new Map(apiPools.map((p) => [p.poolDltId, p]));
      return apiTokens
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
          return buildTokenObjectV3(
            apiToken,
            apiPool,
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

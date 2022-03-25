import { APIPool, APIToken } from 'services/api/bancor';
import { combineLatest, from } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { user$ } from 'services/observables/user';
import {
  fetchETH,
  fetchTokenBalanceMulticall,
} from 'services/web3/token/token';
import { ethToken, ropstenImage } from 'services/web3/config';
import { calculatePercentageChange } from 'utils/formulas';
import { get7DaysAgo } from 'utils/pureFunctions';
import { UTCTimestamp } from 'lightweight-charts';
import { tokenListTokens$ } from 'services/observables/tokenLists';
import { apiData$ } from 'services/observables/apiData';
import { utils } from 'ethers';
import { fetchKeeperDaoTokens } from 'services/api/keeperDao';
import { shareReplay } from 'rxjs/operators';

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
  balances?: Map<string, string>,
  tlToken?: TokenMinimal
): Token => {
  const pool = apiPools.find((p) =>
    p.reserves.find((r) => r.address === apiToken.dlt_id)
  ); // TODO - add usd_volume_24 and isWhiteListed to token api welcome data to avoid this

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
  const isProtected = pool ? pool.isWhitelisted : false;

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
    isProtected, // TODO currently based on isWhitelisted
  };
};

export const userBalancesInWei$ = combineLatest([apiData$, user$]).pipe(
  switchMapIgnoreThrow(async ([apiData, user]) => {
    if (!user) {
      return undefined;
    }
    // get balances for tokens other than ETH
    const balances = await fetchTokenBalanceMulticall(
      apiData.tokens.map((t) => t.dlt_id).filter((id) => id !== ethToken),
      user
    );
    // get balance for ETH
    balances.set(ethToken, await fetchETH(user));
    return balances;
  })
);

export const tokensNew$ = combineLatest([
  apiData$,
  tokenListTokens$,
  userBalancesInWei$,
]).pipe(
  switchMapIgnoreThrow(async ([apiData, tokenListTokens, balances]) => {
    const userPreferredTokenListTokensMap = new Map(
      tokenListTokens.userPreferredTokenListTokens.map((t) => [t.address, t])
    );
    return apiData.tokens
      .map((apiToken) => {
        const tokenListToken = userPreferredTokenListTokensMap.get(
          apiToken.dlt_id
        );
        if (!tokenListToken) {
          return undefined;
        }
        return buildTokenObject(
          apiToken,
          apiData.pools,
          balances,
          tokenListToken
        );
      })
      .filter((token) => !!token) as Token[];
  })
);

export const allTokensNew$ = combineLatest([
  apiData$,
  tokenListTokens$,
  userBalancesInWei$,
]).pipe(
  switchMapIgnoreThrow(async ([apiData, tokenListTokens, balances]) => {
    const allTokenListTokensMap = new Map(
      tokenListTokens.allTokenListTokens.map((t) => [t.address, t])
    );
    return apiData.tokens.map((apiToken) => {
      const tokenListToken = allTokenListTokensMap.get(apiToken.dlt_id);
      return buildTokenObject(
        apiToken,
        apiData.pools,
        balances,
        tokenListToken
      );
    });
  })
);

export const keeperDaoTokens$ = from(fetchKeeperDaoTokens()).pipe(
  shareReplay(1)
);

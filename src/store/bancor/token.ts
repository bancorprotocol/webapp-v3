import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { Token } from 'services/observables/tokens';
import { orderBy, uniqBy } from 'lodash';
import { PoolV3 } from 'services/observables/pools';
import BigNumber from 'bignumber.js';
import { getAllV2AndV3Tokens } from './bancor';

export const getAllTokensV2Map = createSelector(
  [(state: RootState) => state.bancor.allTokensV2],
  (allTokensV2: Token[]): Map<string, Token> => {
    return new Map(allTokensV2.map((token) => [token.address, token]));
  }
);

export const getTokensV3Map = createSelector(
  [(state: RootState) => state.pool.v3Pools],
  (pools: PoolV3[]): Map<string, Token> => {
    return new Map(pools.map((pool) => [pool.poolDltId, pool.reserveToken]));
  }
);

export const getTokensV2V3Map = createSelector(
  [(state: RootState) => getAllV2AndV3Tokens(state)],
  (tokens: Token[]): Map<string, Token> => {
    return new Map(tokens.map((token) => [token.address, token]));
  }
);

export const getAvailableToStakeTokens = createSelector(
  [
    (state: RootState) => state.pool.v3Pools,
    (state: RootState) => getTokensV3Map(state),
  ],
  (pools: PoolV3[], tokensV3Map: Map<string, Token>) => {
    const poolsWithApr = pools
      .map((pool) => {
        const token = tokensV3Map.get(pool.poolDltId);

        return {
          token: token!,
          pool,
        };
      })
      .filter((p) => !!p && !!p.token && !!Number(p.token.balance));

    return orderBy(
      poolsWithApr,
      [
        (x) => x.token.balanceUsd,
        (x) => x.token.balance,
        (x) => x.token.symbol,
      ],
      ['desc', 'desc', 'asc']
    );
  }
);

export const getV3Tokens = createSelector(
  [(state: RootState) => state.pool.v3Pools],
  (pools: PoolV3[]): Token[] => {
    return pools.map((pool) => pool.reserveToken);
  }
);

export const getTokenTableData = createSelector(
  [
    (state: RootState) => state.bancor.allTokensV2,
    (state: RootState) => getV3Tokens(state),
  ],
  (tokens: Token[], v3Tokens: Token[]) => {
    const tokensMap = new Map(tokens.map((token) => [token.address, token]));
    const v3TokensMap = new Map(
      v3Tokens.map((token) => [token.address, token])
    );
    const ids = uniqBy(
      [...tokens.map((t) => t.address), ...v3Tokens.map((t) => t.address)],
      (id) => id
    );
    return ids
      .map((id) => {
        const token = tokensMap.get(id);
        const v3Token = v3TokensMap.get(id);

        if (!token && !v3Token) {
          return undefined;
        }

        if (!(token && v3Token)) {
          return v3Token || token;
        }

        const merged: Token = {
          ...v3Token,
          price_history_7d: token.price_history_7d,
          usd_volume_24: new BigNumber(token.usd_volume_24)
            .plus(v3Token.usd_volume_24)
            .toString(),
          liquidity: new BigNumber(token.liquidity)
            .plus(v3Token.liquidity)
            .toString(),
        };

        return merged;
      })
      .filter((t) => !!t) as Token[];
  }
);

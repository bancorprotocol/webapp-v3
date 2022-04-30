import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { Token } from 'services/observables/tokens';
import { orderBy } from 'lodash';
import { PoolV3 } from 'services/observables/pools';

export const getAllTokensMap = createSelector(
  [(state: RootState) => state.bancor.allTokens],
  (allTokens: Token[]): Map<string, Token> => {
    return new Map(allTokens.map((token) => [token.address, token]));
  }
);

export const getAvailableToStakeTokens = createSelector(
  [
    (state: RootState) => state.pool.v3Pools,
    (state: RootState) => getAllTokensMap(state),
  ],
  (pools: PoolV3[], allTokensMap: Map<string, Token>) => {
    const poolsWithApr = pools
      .map((pool) => {
        const token = allTokensMap.get(pool.poolDltId);
        const tknApr = pool.apr;
        const bntApr = pool.apr;

        return {
          token: token!,
          pool,
          tknApr,
          bntApr,
        };
      })
      .filter((p) => !!p && !!p.token && !!Number(p.token.balance));

    return orderBy(poolsWithApr, 'tknApr', 'desc');
  }
);

export const getV3Tokens = createSelector(
  [
    (state: RootState) => state.pool.v3Pools,
    (state: RootState) => getAllTokensMap(state),
  ],
  (pools: PoolV3[], allTokensMap: Map<string, Token>) => {
    return pools
      .map((pool) => allTokensMap.get(pool.poolDltId))
      .filter((t) => !!t) as Token[];
  }
);

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/index';
import { Pool, Token } from 'services/observables/tokens';
import { orderBy } from 'lodash';

// TODO Filter for V3 Only pools
export const getAvailableToStakeTokens = createSelector(
  [
    (state: RootState) => state.pool.pools,
    (state: RootState) => state.bancor.tokens,
  ],
  (pools: Pool[], tokens: Token[]) => {
    const tokenMap = new Map(tokens.map((t) => [t.address, t]));
    const poolsWithApr = pools
      .map((pool) => {
        const token = tokenMap.get(pool.reserves[0].address);
        const tknApr = pool.apr + (pool.reserves[0].rewardApr || 0);
        const bntApr = pool.apr + (pool.reserves[1].rewardApr || 0);

        return {
          token: token!,
          pool,
          tknApr,
          bntApr,
        };
      })
      .filter((t) => !!t);
    const poolWithHighestBntApr = orderBy(poolsWithApr, 'bntApr', 'desc').slice(
      0,
      1
    );
    const filteredByTokenBalance = poolsWithApr.filter(
      (t) => !!Number(t.token.balance)
    );
    if (poolWithHighestBntApr.length === 1) {
      const bntToken = tokens.find((t) => t.symbol === 'BNT');
      if (bntToken && !!Number(bntToken.balance)) {
        filteredByTokenBalance.push({
          ...poolWithHighestBntApr[0],
          token: bntToken,
          tknApr: poolWithHighestBntApr[0].bntApr,
        });
      }
    }
    return orderBy(filteredByTokenBalance, 'tknApr', 'desc');
  }
);

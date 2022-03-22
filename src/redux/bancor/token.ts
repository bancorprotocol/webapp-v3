import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/index';
import { Pool, Token } from 'services/observables/tokens';
import { orderBy } from 'lodash';

// TODO Filter for V3 Only pools
export const getAvailableToStakeTokens = createSelector(
  [
    (state: RootState) => state.pool.v2Pools,
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
      .filter((p) => !!p && !!p.token);
    const [poolWithHighestBntApr] = orderBy(
      poolsWithApr,
      'bntApr',
      'desc'
    ).slice(0, 1);
    const filteredByTokenBalance = poolsWithApr.filter(
      (p) => !!Number(p.token.balance)
    );
    if (poolWithHighestBntApr) {
      const bntToken = tokens.find((t) => t.symbol === 'BNT');
      if (bntToken && !!Number(bntToken.balance)) {
        filteredByTokenBalance.push({
          ...poolWithHighestBntApr,
          token: bntToken,
          tknApr: poolWithHighestBntApr.bntApr,
        });
      }
    }
    return orderBy(filteredByTokenBalance, 'tknApr', 'desc');
  }
);

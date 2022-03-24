import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { orderBy } from 'lodash';
import { bntToken } from 'services/web3/config';
import { Pool } from 'services/observables/v3/pools';

export const getAllTokensMap = createSelector(
  [(state: RootState) => state.bancor.allTokens],
  (allTokens: Token[]): Map<string, Token> => {
    return new Map(allTokens.map((token) => [token.address, token]));
  }
);

// TODO Filter for V3 Only pools
export const getAvailableToStakeTokens = createSelector(
  [
    (state: RootState) => state.pool.v2Pools,
    (state: RootState) => getAllTokensMap(state),
  ],
  (pools: Pool[], allTokensMap: Map<string, Token>) => {
    const poolsWithApr = pools
      .map((pool) => {
        const token = allTokensMap.get(pool.reserves[0].address);
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
      const bnt = allTokensMap.get(bntToken);
      if (bnt && !!Number(bnt.balance)) {
        filteredByTokenBalance.push({
          ...poolWithHighestBntApr,
          token: bnt,
          tknApr: poolWithHighestBntApr.bntApr,
        });
      }
    }
    return orderBy(filteredByTokenBalance, 'tknApr', 'desc');
  }
);

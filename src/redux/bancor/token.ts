import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { orderBy } from 'lodash';
import { bntToken } from 'services/web3/config';
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
        const token = allTokensMap.get(pool.pool_dlt_id);
        const tknApr = pool.apr;
        const bntApr = pool.apr;

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

export const getV3Tokens = createSelector(
  [
    (state: RootState) => state.pool.v3Pools,
    (state: RootState) => getAllTokensMap(state),
  ],
  (pools: PoolV3[], allTokensMap: Map<string, Token>) => {
    return pools
      .map((pool) => allTokensMap.get(pool.pool_dlt_id))
      .filter((t) => !!t) as Token[];
  }
);

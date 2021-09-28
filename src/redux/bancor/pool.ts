import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Pool } from 'services/observables/tokens';
import { Statistic } from 'services/observables/statistics';
import { RootState } from 'redux/index';
import { orderBy } from 'lodash';
import BigNumber from 'bignumber.js';

interface PoolState {
  pools: Pool[];
  statistics: Statistic[];
}

const initialState: PoolState = {
  pools: [],
  statistics: [],
};

const poolSlice = createSlice({
  name: 'pool',
  initialState,
  reducers: {
    setPools: (state, action) => {
      state.pools = action.payload;
    },
    setStats: (state, action) => {
      state.statistics = action.payload;
    },
  },
});

export interface TopPool {
  tknSymbol: string;
  tknLogoURI: string;
  apr: number;
  poolName: string;
}

export const getPools = createSelector(
  (state: RootState) => state.pool.pools,
  (pools: Pool[]) => {
    return orderBy(pools, 'liquidity', 'desc');
  }
);

export const getTopPools = createSelector(
  (state: RootState) => state.pool.pools,
  (pools: Pool[]) => {
    const filteredPools = pools
      .filter((p) => p.isWhitelisted && p.liquidity > 100000)
      .map((p) => {
        return {
          tknSymbol: p.reserves[0].symbol,
          tknLogoURI: p.reserves[0].logoURI,
          tknApr: p.apr + (p.reserves[0].rewardApr || 0),
          bntSymbol: p.reserves[1].symbol,
          bntLogoURI: p.reserves[1].logoURI,
          bntApr: p.apr + (p.reserves[1].rewardApr || 0),
          poolName: p.name,
        };
      });
    const winningBntPool = orderBy(filteredPools, 'bntApr', 'desc').slice(0, 1);
    const topPools: TopPool[] = filteredPools.map((p) => {
      return {
        tknSymbol: p.tknSymbol,
        tknLogoURI: p.tknLogoURI,
        poolName: p.poolName,
        apr: p.tknApr,
      };
    });
    if (winningBntPool.length === 1) {
      topPools.push({
        tknSymbol: winningBntPool[0].bntSymbol,
        tknLogoURI: winningBntPool[0].bntLogoURI,
        apr: winningBntPool[0].bntApr,
        poolName: winningBntPool[0].poolName,
      });
    }
    return orderBy(topPools, 'apr', 'desc').slice(0, 20);
  }
);

export const getPoolById = (id: string) =>
  createSelector(
    (state: RootState) => state.pool.pools,
    (pools: Pool[]) => {
      if (pools.length === 0) {
        return null;
      }

      const pool = pools.find((p) => p.pool_dlt_id === id);
      if (pool === undefined) {
        return undefined;
      }
      let type: 'empty' | 'single' | 'dual';

      if (pool.isProtected) {
        type = 'single';
      } else {
        const poolHasLiquidity = pool.reserves.some((reserve) =>
          new BigNumber(reserve.balance).gt(0)
        );
        type = poolHasLiquidity ? 'dual' : 'empty';
      }

      return { pool, type };
    }
  );

export const { setPools, setStats } = poolSlice.actions;

export const pool = poolSlice.reducer;

import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Pool } from 'services/observables/tokens';
import { Statistic } from 'services/observables/statistics';
import { RootState } from 'redux/index';
import { orderBy } from 'lodash';

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

export const getTopPools = createSelector(
  (state: RootState) => state.pool.pools,
  (pools: Pool[]) => {
    const filteredPools = pools
      .filter((p) => p.isWhitelisted && p.liquidity > 100000)
      .map((p) => {
        return {
          ...p,
          name: p.reserves[0].symbol,
          apr: p.apr + (p.reserves[0].rewardApr || 0),
        };
      });
    return orderBy(filteredPools, 'apr', 'desc').slice(0, 20);
  }
);

export const { setPools, setStats } = poolSlice.actions;

export const pool = poolSlice.reducer;

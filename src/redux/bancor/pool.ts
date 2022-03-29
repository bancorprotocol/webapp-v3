import { createSelector, createSlice } from '@reduxjs/toolkit';
import { Token } from 'services/observables/tokens';
import { Statistic } from 'services/observables/statistics';
import { RootState } from 'redux/index';
import { isEqual, orderBy } from 'lodash';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { Pool, PoolV3 } from 'services/observables/pools';

interface PoolState {
  v2Pools: Pool[];
  v3Pools: PoolV3[];
  statistics: Statistic[];
}

const initialState: PoolState = {
  v2Pools: [],
  v3Pools: [],
  statistics: [],
};

const poolSlice = createSlice({
  name: 'pool',
  initialState,
  reducers: {
    setv2Pools: (state, action) => {
      state.v2Pools = action.payload;
    },
    setv3Pools: (state, action) => {
      state.v3Pools = action.payload;
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
  (state: RootState) => state.pool.v2Pools,
  (state: RootState) => state.bancor.tokens,
  (pools: Pool[], tokens: Token[]) => {
    const pools_token_list = pools.filter((pool) => {
      return (
        tokens.findIndex(
          (token) => pool.reserves[0].address === token.address
        ) !== -1
      );
    });
    return orderBy(pools_token_list, 'liquidity', 'desc');
  }
);

export const getProtectedPools: any = createSelector(
  getPools,
  (pools: Pool[]) => pools.filter((p) => p.isProtected)
);

export const getTopPools: any = createSelector(getPools, (pools: Pool[]) => {
  const filteredPools = pools
    .filter((p) => p.isProtected && p.liquidity > 100000)
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
});

export interface SelectedPool {
  status: 'loading' | 'ready';
  pool?: Pool;
}

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const getPoolById = (id: string) =>
  createDeepEqualSelector(
    (state: RootState) => state.pool.v2Pools,
    (pools: Pool[]) => {
      if (pools.length === 0) {
        return { status: 'loading' } as SelectedPool;
      }

      const pool = pools.find((p) => p.pool_dlt_id === id);
      return { status: 'ready', pool } as SelectedPool;
    }
  );

export const { setv2Pools, setv3Pools, setStats } = poolSlice.actions;

export const pool = poolSlice.reducer;

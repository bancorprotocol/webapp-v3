import { createSelector, createSlice } from '@reduxjs/toolkit';
import { Token } from 'services/observables/tokens';
import { RootState } from 'store';
import { isEqual, orderBy } from 'lodash';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { Pool, PoolV3 } from 'services/observables/pools';

interface PoolState {
  v2Pools: Pool[];
  v3Pools: PoolV3[];
  isLoadingV3Pools: boolean;
}

const initialState: PoolState = {
  v2Pools: [],
  v3Pools: [],
  isLoadingV3Pools: true,
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
      state.isLoadingV3Pools = false;
    },
  },
});

export const getPools = createSelector(
  (state: RootState) => state.pool.v2Pools,
  (state: RootState) => state.bancor.tokensV2,
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

export const getPoolsV3Map = createSelector(
  [(state: RootState) => state.pool.v3Pools],
  (pools: PoolV3[]): Map<string, PoolV3> => {
    return new Map(pools.map((pool) => [pool.poolDltId, pool]));
  }
);

export const getV2PoolsWithoutV3 = createSelector(
  (state: RootState) => state.pool.v2Pools,
  (state: RootState) => state.pool.v3Pools,
  (poolsV2: Pool[], poolsV3: PoolV3[]) => {
    return poolsV2.filter(
      (v2Pool) =>
        poolsV3.findIndex(
          (v3Pool) => v2Pool.reserves[0].address === v3Pool.reserveToken.address
        ) === -1
    );
  }
);

export const getProtectedPools = createSelector(getPools, (pools: Pool[]) =>
  pools.filter((p) => p.isProtected)
);

export const getIsV3Exist = createSelector(
  [(state: RootState) => getPoolsV3Map(state), (_: any, id: string) => id],
  (pools: Map<string, PoolV3>, id): boolean => {
    return !!pools.get(id);
  }
);

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

export const getPoolByIdWithoutV3 = (id: string) =>
  createDeepEqualSelector(getV2PoolsWithoutV3, (pools: Pool[]) => {
    if (pools.length === 0) {
      return { status: 'loading' } as SelectedPool;
    }

    const pool = pools.find((p) => p.pool_dlt_id === id);
    return { status: 'ready', pool } as SelectedPool;
  });

export const { setv2Pools, setv3Pools } = poolSlice.actions;

export const pool = poolSlice.reducer;

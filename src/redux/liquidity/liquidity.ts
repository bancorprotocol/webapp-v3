import { createSlice } from '@reduxjs/toolkit';
import { PoolToken } from 'services/observables/tokens';

interface LiquidityState {
  poolTokens: PoolToken[];
}

const initialState: LiquidityState = {
  poolTokens: [],
};

const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers: {
    setPoolTokens: (state, action) => {
      state.poolTokens = action.payload;
    },
  },
});

export const { setPoolTokens } = liquiditySlice.actions;

export const liquidity = liquiditySlice.reducer;

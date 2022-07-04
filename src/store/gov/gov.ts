import { createSlice } from '@reduxjs/toolkit';

export interface GovState {
  stakedAmount?: string;
  unstakeTimer?: number;
}

export const initialState: GovState = {
  stakedAmount: undefined,
  unstakeTimer: undefined,
};

const govSlice = createSlice({
  name: 'gov',
  initialState,
  reducers: {
    setStakedAmount: (state, action) => {
      state.stakedAmount = action.payload;
    },
    setUnstakeTimer: (state, action) => {
      state.unstakeTimer = action.payload;
    },
  },
});

export const { setStakedAmount, setUnstakeTimer } = govSlice.actions;

export const gov = govSlice.reducer;

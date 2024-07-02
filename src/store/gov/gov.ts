import { createSlice } from '@reduxjs/toolkit';

export interface GovState {
  stakedVbntAmount?: string;
  unstakeVbntTimer?: number;
  stakedBntAmount?: string;
  unstakeBntTimer?: number;
}

export const initialState: GovState = {
  stakedVbntAmount: undefined,
  unstakeVbntTimer: undefined,
  stakedBntAmount: undefined,
  unstakeBntTimer: undefined,
};

const govSlice = createSlice({
  name: 'gov',
  initialState,
  reducers: {
    setStakedVbntAmount: (state, action) => {
      state.stakedVbntAmount = action.payload;
    },
    setUnstakeVbntTimer: (state, action) => {
      state.unstakeVbntTimer = action.payload;
    },
    setStakedBntAmount: (state, action) => {
      state.stakedBntAmount = action.payload;
    },
    setUnstakeBntTimer: (state, action) => {
      state.unstakeBntTimer = action.payload;
    },
  },
});

export const {
  setStakedVbntAmount,
  setUnstakeVbntTimer,
  setStakedBntAmount,
  setUnstakeBntTimer,
} = govSlice.actions;

export const gov = govSlice.reducer;

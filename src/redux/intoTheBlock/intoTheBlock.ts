import { createSlice } from '@reduxjs/toolkit';
import { IntoTheBlock } from 'services/api/intoTheBlock';

export interface IntoTheBlockState {
  fromToken: IntoTheBlock | undefined;
  toToken: IntoTheBlock | undefined;
}

export const initialState: IntoTheBlockState = {
  fromToken: undefined,
  toToken: undefined,
};

const intoTheBlockSlice = createSlice({
  name: 'intoTheBlock',
  initialState,
  reducers: {
    setFromToken: (state, action) => {
      state.fromToken = action.payload;
    },
    setToToken: (state, action) => {
      state.toToken = action.payload;
    },
  },
});

export const { setFromToken, setToToken } = intoTheBlockSlice.actions;

export const intoTheBlock = intoTheBlockSlice.reducer;

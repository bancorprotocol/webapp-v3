import { createSlice } from '@reduxjs/toolkit';

export interface ModalsState {
  disableDepositOpen: boolean;
}

export const initialState: ModalsState = {
  disableDepositOpen: false,
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    setDisableDepositOpen: (state, action) => {
      state.disableDepositOpen = action.payload;
    },
  },
});

export const { setDisableDepositOpen } = modalsSlice.actions;

export const modals = modalsSlice.reducer;

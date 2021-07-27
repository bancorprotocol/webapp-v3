import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  darkMode: boolean;
  walletModal: boolean;
  slippageTolerance: number;
  locale: string;
}

export const initialState: UserState = {
  darkMode: false,
  walletModal: false,
  slippageTolerance: 0.01,
  locale: 'en',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;

      const root = window.document.documentElement;
      if (action.payload) root.classList.add('dark');
      else root.classList.remove('dark');

      localStorage.setItem('darkMode', JSON.stringify(action.payload));
    },
    setSlippageTolerance: (state, action) => {
      localStorage.setItem('slippageTolerance', JSON.stringify(action.payload));
      state.slippageTolerance = action.payload;
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
    openWalletModal: (state, action) => {
      state.walletModal = action.payload;
    },
  },
});

export const { setDarkMode, setSlippageTolerance, setLocale, openWalletModal } =
  userSlice.actions;

export const user = userSlice.reducer;

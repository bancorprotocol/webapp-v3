import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  setDarkModeLS,
  setSlippageToleranceLS,
  setUsdToggleLS,
} from 'utils/localStorage';

export interface UserState {
  darkMode: boolean;
  walletModal: boolean;
  slippageTolerance: number;
  usdToggle: boolean;
  locale: string;
  user: string | undefined;
}

export const initialState: UserState = {
  darkMode: false,
  walletModal: false,
  slippageTolerance: 0.005,
  usdToggle: false,
  locale: 'en',
  user: undefined,
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

      setDarkModeLS(action.payload);
    },
    setUser: (state, action: PayloadAction<string | undefined>) => {
      state.user = action.payload;
    },
    setSlippageTolerance: (state, action) => {
      setSlippageToleranceLS(action.payload);
      state.slippageTolerance = action.payload;
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
    openWalletModal: (state, action) => {
      state.walletModal = action.payload;
    },
    setUsdToggle: (state, action: PayloadAction<boolean>) => {
      setUsdToggleLS(action.payload);
      state.usdToggle = action.payload;
    },
  },
});

export const {
  setDarkMode,
  setSlippageTolerance,
  setLocale,
  openWalletModal,
  setUser,
  setUsdToggle,
} = userSlice.actions;

export const user = userSlice.reducer;

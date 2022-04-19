import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isForkAvailable } from 'services/web3/config';
import {
  setDarkModeLS,
  setSlippageToleranceLS,
  setUsdToggleLS,
} from 'utils/localStorage';

export interface UserState {
  account: string | null | undefined;
  darkMode: boolean;
  walletModal: boolean;
  slippageTolerance: number;
  usdToggle: boolean;
  locale: string;
  loadingBalances: boolean;
  isFork: boolean;
}

export const initialState: UserState = {
  account: undefined,
  darkMode: false,
  walletModal: false,
  slippageTolerance: 0.005,
  usdToggle: false,
  locale: 'en',
  loadingBalances: false,
  isFork: isForkAvailable,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;

      const root = window.document.documentElement;
      if (action.payload) root.classList.add('dark');
      else root.classList.remove('dark');

      setDarkModeLS(action.payload);
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
    setLoadingBalances: (state, action) => {
      state.loadingBalances = action.payload;
    },
    setIsFork: (state, action) => {
      state.isFork = action.payload;
    },
  },
});

export const {
  setAccount,
  setDarkMode,
  setSlippageTolerance,
  setLocale,
  openWalletModal,
  setUsdToggle,
  setLoadingBalances,
  setIsFork,
} = userSlice.actions;

export const user = userSlice.reducer;

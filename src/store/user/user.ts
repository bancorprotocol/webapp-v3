import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';
import {
  setDarkModeLS,
  setSlippageToleranceLS,
  setUsdToggleLS,
} from 'utils/localStorage';
import { LocaleType } from '../../i18n';

export enum DarkMode {
  Dark,
  Light,
  System,
}

export interface UserState {
  account: string | null | undefined;
  darkMode: DarkMode;
  walletModal: boolean;
  slippageTolerance: number;
  usdToggle: boolean;
  locale: LocaleType;
  loadingBalances: boolean;
  forceV3Routing: boolean;
}

export const initialState: UserState = {
  account: undefined,
  darkMode: DarkMode.System,
  walletModal: false,
  slippageTolerance: 0.005,
  usdToggle: false,
  locale: 'en',
  loadingBalances: false,
  forceV3Routing: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<DarkMode>) => {
      state.darkMode = action.payload;
      setDarkModeCss(action.payload);
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
    setForceV3Routing: (state, action) => {
      state.forceV3Routing = action.payload;
    },
  },
});

export const getDarkMode = createSelector(
  (state: RootState) => state.user.darkMode,
  (mode: DarkMode): boolean => {
    return (
      (mode === DarkMode.System &&
        window.matchMedia('(prefers-color-scheme:dark)').matches) ||
      mode === DarkMode.Dark
    );
  }
);

const setDarkModeCss = (mode: DarkMode) => {
  const root = window.document.documentElement;
  if (
    (mode === DarkMode.System &&
      window.matchMedia('(prefers-color-scheme:dark)').matches) ||
    mode === DarkMode.Dark
  )
    root.classList.add('dark');
  else root.classList.remove('dark');
};

export const {
  setAccount,
  setDarkMode,
  setSlippageTolerance,
  setLocale,
  openWalletModal,
  setUsdToggle,
  setLoadingBalances,
  setForceV3Routing,
} = userSlice.actions;

export const user = userSlice.reducer;

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';
import {
  getForceV3LS,
  setForceV3LS,
  getForceV2LS,
  setForceV2LS,
  setDarkModeLS,
  setSlippageToleranceLS,
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
  locale: LocaleType;
  loadingBalances: boolean;
  forceV3Routing: boolean;
  forceV2Routing: boolean;
}

export const initialState: UserState = {
  account: undefined,
  darkMode: DarkMode.System,
  walletModal: false,
  slippageTolerance: 0.005,
  locale: 'en',
  loadingBalances: false,
  forceV3Routing: getForceV3LS(),
  forceV2Routing: getForceV2LS(),
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
    setLoadingBalances: (state, action) => {
      state.loadingBalances = action.payload;
    },
    setForceV3Routing: (state, action) => {
      state.forceV3Routing = action.payload;
      setForceV3LS(action.payload);
    },
    setForceV2Routing: (state, action) => {
      state.forceV2Routing = action.payload;
      setForceV2LS(action.payload);
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

export const setDarkModeCss = (mode: DarkMode) => {
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
  setLoadingBalances,
  setForceV3Routing,
  setForceV2Routing,
} = userSlice.actions;

export const user = userSlice.reducer;

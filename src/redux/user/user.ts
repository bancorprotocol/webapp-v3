import { createSlice } from '@reduxjs/toolkit';

export interface UserState {
  darkMode: boolean;
  slippageTolerance: number;
  locale: string;
}

export const initialState: UserState = {
  darkMode: false,
  slippageTolerance: 0.005,
  locale: 'en',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    setSlippageTolerance: (state, action) => {
      state.slippageTolerance = action.payload;
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
  },
});

export const { setDarkMode, setSlippageTolerance, setLocale } =
  userSlice.actions;

export const user = userSlice.reducer;

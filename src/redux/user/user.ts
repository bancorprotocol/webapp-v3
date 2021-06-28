import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;

      const root = window.document.documentElement;
      if (action.payload) root.classList.add('dark');
      else root.classList.remove('dark');

      localStorage.setItem('darkMode', JSON.stringify(action.payload));
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

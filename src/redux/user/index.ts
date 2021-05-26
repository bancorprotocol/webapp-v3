import { createSlice } from '@reduxjs/toolkit';

export interface UserState {
  darkMode: boolean;
}

export const initialState = {
  darkMode: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setDarkMode: (user, action) => {
      user.darkMode = action.payload;
    },
  },
});

export const { setDarkMode } = userSlice.actions;

export const user = userSlice.reducer;

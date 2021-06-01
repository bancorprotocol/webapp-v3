import { createSlice } from '@reduxjs/toolkit';

export interface UserState {
  darkMode: boolean;
}

export const initialState: UserState = {
  darkMode: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDarkMode: (currentState, action) => {
      user.darkMode = action.payload;
    },
  },
});

export const { setDarkMode } = userSlice.actions;

export const user = userSlice.reducer;

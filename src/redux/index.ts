import { configureStore } from '@reduxjs/toolkit';
import { user } from 'redux/user';

export const store = configureStore({
  reducer: {
    user,
  },
});

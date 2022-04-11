import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { user } from 'redux/user/user';
import { bancor } from 'redux/bancor/bancor';
import { pool } from 'redux/bancor/pool';
import { notification } from 'redux/notification/notification';
import { liquidity } from './liquidity/liquidity';
import { v3Portfolio } from 'redux/portfolio/v3Portfolio';

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          'bancor.allTokenListTokens',
          'bancor.allTokens',
          'bancor.tokenLists',
        ],
      },
    }),
  reducer: {
    user,
    notification,
    bancor,
    pool,
    liquidity,
    v3Portfolio,
  },
});

// @ts-ignore
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

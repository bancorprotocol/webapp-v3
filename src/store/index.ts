import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { user } from 'store/user/user';
import { bancor } from 'store/bancor/bancor';
import { pool } from 'store/bancor/pool';
import { notification } from 'store/notification/notification';
import { liquidity } from './liquidity/liquidity';
import { v3Portfolio } from 'store/portfolio/v3Portfolio';
import { gov } from './gov/gov';
import { modals } from './modals/modals';

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
    gov,
    modals,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

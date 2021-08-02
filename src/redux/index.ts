import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { user } from 'redux/user/user';
import { bancorAPI } from 'redux/bancorAPI/bancorAPI';
import { bancor } from 'redux/bancor/bancor';
import { notification } from 'redux/notification/notification';
import { intoTheBlock } from 'redux/intoTheBlock/intoTheBlock';

export const store = configureStore({
  reducer: {
    user,
    notification,
    bancorAPI,
    bancor,
    intoTheBlock,
  },
});

// @ts-ignore
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

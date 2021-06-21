import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

type NotificationType = 'info' | 'success' | 'error' | 'pending';

export interface BaseNotification {
  type?: NotificationType;
  title: string;
  msg: string;
  showSeconds?: number;
  txHash?: string;
}

export interface Notification extends BaseNotification {
  id: string;
  timestamp: number;
}

export interface NotificationState {
  notifications: Notification[];
}

export const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'no',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<BaseNotification>) => {
      state.notifications.push({
        id: nanoid(),
        type: 'info',
        timestamp: dayjs().unix(),
        showSeconds: 8,
        ...action.payload,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload
      );
      if (index > -1) state.notifications.splice(index, 1);
    },
    hideAlert: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload
      );
      if (index > -1) state.notifications[index].showSeconds = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  hideAlert,
} = notificationSlice.actions;

export const notification = notificationSlice.reducer;

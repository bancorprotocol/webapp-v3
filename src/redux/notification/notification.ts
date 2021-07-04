import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export enum NotificationType {
  info,
  success,
  error,
  pending,
}

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
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<BaseNotification>) => {
      state.notifications.push({
        id: nanoid(),
        type: NotificationType.info,
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
    setStatus: (
      state,
      action: PayloadAction<{ id: string; type: NotificationType }>
    ) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload.id
      );
      if (index > -1) state.notifications[index].type = action.payload.type;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  hideAlert,
  setStatus,
} = notificationSlice.actions;

export const notification = notificationSlice.reducer;

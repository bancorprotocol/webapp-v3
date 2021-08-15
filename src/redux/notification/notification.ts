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
  updatedInfo?: UpdatedInfo;
}

interface UpdatedInfo {
  successTitle?: string;
  successMsg?: string;
  errorTitle?: string;
  errorMsg?: string;
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

const defaultShowSeconds = ({ type }: BaseNotification) => {
  switch (type) {
    case NotificationType.success:
      return 10;
    default:
      return 8;
  }
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<BaseNotification>) => {
      const length = state.notifications.unshift({
        id: nanoid(),
        type: NotificationType.info,
        timestamp: dayjs().unix(),
        showSeconds: defaultShowSeconds(action.payload),
        ...action.payload,
      });

      if (length > 100) {
        state.notifications.pop();
      }
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
      action: PayloadAction<{
        id: string;
        type: NotificationType;
        title?: string;
        msg?: string;
      }>
    ) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload.id
      );
      if (index > -1) {
        const oldNotification = state.notifications[index];
        const notification = {
          id: oldNotification.id,
          type: action.payload.type,
          title: action.payload.title
            ? action.payload.title
            : oldNotification.title,
          msg: action.payload.msg ? action.payload.msg : oldNotification.msg,
          showSeconds: oldNotification.showSeconds,
          txHash: oldNotification.txHash,
          timestamp: oldNotification.timestamp,
        };
        state.notifications[index] = notification;
      }
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

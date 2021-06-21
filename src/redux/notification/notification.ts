import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

type NotificationType = 'info' | 'success' | 'error' | 'pending';

export interface BaseNotification {
  type: NotificationType;
  title: string;
  msg: string;
  showSeconds: number;
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
  notifications: [
    {
      id: nanoid(),
      type: 'success',
      title: 'Transaction in Progress',
      msg: 'Some sample message here',
      showSeconds: 8,
      timestamp: 1624271663,
    },
    {
      id: nanoid(),
      type: 'pending',
      title: 'Transaction in Progress',
      msg: 'Some sample message here',
      showSeconds: 8,
      timestamp: 1624271663,
    },
    {
      id: nanoid(),
      type: 'error',
      title: 'Transaction in Progress',
      msg: 'Some sample message here',
      showSeconds: 8,
      timestamp: 1624271663,
    },
    {
      id: nanoid(),
      type: 'info',
      title: 'Transaction in Progress',
      msg: 'Some sample message here',
      showSeconds: 8,
      timestamp: 1624271663,
    },
  ],
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
        timestamp: dayjs().unix(),
        ...action.payload,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload
      );
      if (index > -1) state.notifications.splice(index, 1);
    },
  },
});

export const { setNotifications, addNotification, removeNotification } =
  notificationSlice.actions;

export const notification = notificationSlice.reducer;

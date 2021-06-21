import { NotificationAlert } from 'elements/notifications/NotificationAlert';
import { useAppSelector } from 'redux/index';
import { Notification } from 'redux/notification/notification';

export const NotificationAlerts = () => {
  const notifications = useAppSelector<Notification[]>(
    (state) => state.notification.notifications
  );

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 top-[85px] right-[20px] flex items-end pointer-events-none sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-15 sm:items-end">
        {notifications.map((notification, index) => {
          return <NotificationAlert key={index} data={notification} />;
        })}
      </div>
    </div>
  );
};

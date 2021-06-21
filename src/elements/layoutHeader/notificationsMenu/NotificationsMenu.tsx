import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { useAppSelector } from 'redux/index';
import {
  Notification,
  removeNotification,
} from 'redux/notification/notification';
import { NotificationContent } from 'elements/notifications/NotificationContent';
import { useDispatch } from 'react-redux';

export const NotificationsMenu = () => {
  const dispatch = useDispatch();

  const notifications = useAppSelector<Notification[]>(
    (state) => state.notification.notifications
  );

  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center">
        <IconBell className="w-[20px]" />
      </Popover.Button>

      <DropdownTransition>
        <Popover.Panel className="dropdown-menu">
          <div className="dropdown-bubble" />

          <div className="dropdown-header flex justify-between">
            <h3 className="text-16 font-semibold">Notifications</h3>
            <button className="text-12 underline">clear</button>
          </div>

          {notifications.map((notification, index) => {
            return (
              <div key={index}>
                <NotificationContent
                  data={notification}
                  onRemove={(id: string) => dispatch(removeNotification(id))}
                />
                {notifications.length > index + 1 && (
                  <hr className="my-10 border-grey-3 border-opacity-50" />
                )}
              </div>
            );
          })}
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};

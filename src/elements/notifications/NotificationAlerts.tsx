import { useAppSelector } from 'redux/index';
import { Notification, hideAlert } from 'redux/notification/notification';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { NotificationContent } from 'elements/notifications/NotificationContent';
import { useDispatch } from 'react-redux';

export const NotificationAlerts = () => {
  const dispatch = useDispatch();

  const notifications = useAppSelector<Notification[]>(
    (state) => state.notification.notifications
  );

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 top-[85px] right-[20px] flex items-end pointer-events-none sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-15 sm:items-end">
        {notifications
          .filter((x) => x.showSeconds)
          .map((notification, index) => {
            return (
              <Transition
                key={notification.id}
                show={true}
                as={Fragment}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="px-20 py-20 max-w-sm w-full bg-white shadow-header rounded pointer-events-auto overflow-hidden">
                  <NotificationContent
                    data={notification}
                    onRemove={(id: string) => dispatch(hideAlert(id))}
                  />
                </div>
              </Transition>
            );
          })}
      </div>
    </div>
  );
};

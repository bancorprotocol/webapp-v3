import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { useAppSelector } from 'redux/index';
import {
  Notification,
  removeNotification,
  setNotifications,
} from 'redux/notification/notification';
import { NotificationContent } from 'elements/notifications/NotificationContent';
import { useDispatch } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';

export const NotificationsMenu = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const notifications = useAppSelector<Notification[]>(
    (state) => state.notification.notifications
  );

  const sorted = useMemo(() => [...notifications].reverse(), [notifications]);

  useEffect(() => {
    const restored = localStorage.getItem('notifications');
    if (restored) dispatch(setNotifications(JSON.parse(restored)));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const title = (
    <>
      <span>Notifications</span>
      <button
        onClick={() => dispatch(setNotifications([]))}
        className="text-12 underline"
      >
        clear
      </button>
    </>
  );

  const history = sorted.map((notification, index) => {
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
  });

  return (
    <>
      <Popover className="hidden md:block relative">
        <Popover.Button className="flex items-center">
          <IconBell className="w-[20px]" />
        </Popover.Button>

        <DropdownTransition>
          <Popover.Panel className="dropdown-menu">
            <div className="dropdown-bubble" />

            <div className="-mr-18 pr-18 max-h-[400px] overflow-auto">
              <div className="dropdown-header flex justify-between text-16 font-semibold">
                {title}
              </div>

              {history}
            </div>
          </Popover.Panel>
        </DropdownTransition>
      </Popover>

      <div className="md:hidden">
        <button onClick={() => setShowModal(true)}>
          <IconBell className="w-[22px]" />
        </button>

        <ModalFullscreen
          title={title}
          setIsOpen={setShowModal}
          isOpen={showModal}
          showHeader
        >
          {history}
        </ModalFullscreen>
      </div>
    </>
  );
};

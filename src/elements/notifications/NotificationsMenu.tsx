import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { useAppSelector } from 'redux/index';
import {
  Notification,
  NotificationType,
  removeNotification,
  setNotifications,
  setStatus,
} from 'redux/notification/notification';
import { NotificationContent } from 'elements/notifications/NotificationContent';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';
import { useInterval } from 'hooks/useInterval';
import { web3 } from 'services/web3';

export const NotificationsMenu = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const notifications = useAppSelector<Notification[]>(
    (state) => state.notification.notifications
  );

  const checkStatus = async (notification: Notification) => {
    if (!notification.txHash) return;
    try {
      const tx = await web3.provider.getTransactionReceipt(notification.txHash);
      if (tx !== null) {
        dispatch(
          setStatus({
            id: notification.id,
            type: tx.status ? NotificationType.success : NotificationType.error,
            title: tx.status
              ? notification.updatedInfo?.successTitle
              : notification.updatedInfo?.errorTitle,
            msg: tx.status
              ? notification.updatedInfo?.successMsg
              : notification.updatedInfo?.errorMsg,
          })
        );
      }
    } catch (e: any) {}
  };

  useInterval(async () => {
    notifications
      .filter((n) => n.type === NotificationType.pending)
      .forEach((n) => checkStatus(n));
  }, 2000);

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

  const history = notifications.map((notification, index) => {
    return (
      <div key={notification.id}>
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

  const hasPendingTx = () =>
    notifications.some((n) => n.type === NotificationType.pending);

  return (
    <>
      <Popover className="hidden md:block relative">
        <Popover.Button className="relative flex items-center">
          {hasPendingTx() && (
            <span className="absolute flex items-center justify-center h-[8px] w-[8px] top-[-5px] right-[-5px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75">
                &nbsp;
              </span>
              <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-error">
                &nbsp;
              </span>
            </span>
          )}

          <IconBell className="w-[20px]" />
        </Popover.Button>

        <DropdownTransition>
          <Popover.Panel static className="dropdown-menu">
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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center"
        >
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

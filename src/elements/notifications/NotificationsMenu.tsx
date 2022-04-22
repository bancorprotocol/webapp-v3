import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { useAppSelector } from 'store';
import {
  Notification,
  NotificationType,
  removeNotification,
  setNotifications,
  setStatus,
} from 'store/notification/notification';
import { NotificationContent } from 'elements/notifications/NotificationContent';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useInterval } from 'hooks/useInterval';
import { web3 } from 'services/web3';
import { MobileSidebar } from 'elements/layoutHeader/MobileSidebar';

export const NotificationsMenu = () => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
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

  const clearAll = (
    <button
      onClick={() => dispatch(setNotifications([]))}
      className="text-12 underline"
    >
      Clear all
    </button>
  );

  const history = notifications.map((notification, index) => {
    return (
      <div key={notification.id}>
        <NotificationContent
          data={notification}
          onRemove={(id: string) => dispatch(removeNotification(id))}
        />
        {notifications.length > index + 1 && (
          <hr className="my-10 border-graphite border-opacity-50" />
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
            <div className="-mr-18 pr-18 max-h-[400px] overflow-auto">
              <div className="dropdown-header flex justify-between text-16 font-semibold">
                <span>Notifications</span>
                {clearAll}
              </div>
              {history}
            </div>
          </Popover.Panel>
        </DropdownTransition>
      </Popover>

      <div className="md:hidden">
        <button onClick={() => setShow(true)} className="flex items-center">
          <IconBell className="w-[22px]" />
        </button>

        <MobileSidebar
          show={show}
          setShow={setShow}
          title="Notifications"
          action={clearAll}
        >
          <>{history}</>
        </MobileSidebar>
      </div>
    </>
  );
};

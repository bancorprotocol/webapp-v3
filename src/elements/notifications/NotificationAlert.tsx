import { Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import {
  NotificationContent,
  NotificationContentProps,
} from 'elements/notifications/NotificationContent';

export const NotificationAlert = ({
  data,
  onRemove,
}: NotificationContentProps) => {
  const [show, setShow] = useState(true);

  const hide = (id: string) => {
    setShow(false);
    onRemove(id);
  };

  return (
    <Transition
      appear={true}
      show={show}
      as={Fragment}
      enter="transform ease-out duration-1000 transition"
      enterFrom="translate-y-20 opacity-0 sm:translate-y-0 sm:translate-x-20"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="px-20 py-20 max-w-sm w-full bg-white dark:bg-blue-2 shadow-header rounded pointer-events-auto overflow-hidden">
        <NotificationContent data={data} onRemove={hide} isAlert />
      </div>
    </Transition>
  );
};

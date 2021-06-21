import { Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { NotificationContent } from 'elements/notifications/NotificationContent';
import { Notification } from 'redux/notification/notification';

export const NotificationAlert = ({ data }: { data: Notification }) => {
  const [show, setShow] = useState(true);

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="px-20 py-20 max-w-sm w-full bg-white shadow-header rounded pointer-events-auto overflow-hidden">
        <NotificationContent data={data} onRemove={() => setShow(false)} />
      </div>
    </Transition>
  );
};

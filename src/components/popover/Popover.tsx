import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface MenuPopoverProps {
  buttonLabel: string | JSX.Element | JSX.Element[];
  buttonClass?: string;
  children: JSX.Element | JSX.Element[];
}

export const MenuPopover = ({
  buttonLabel,
  buttonClass,
  children,
}: MenuPopoverProps) => {
  return (
    <Popover className="relative">
      <Popover.Button className={buttonClass}>{buttonLabel}</Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute z-10 w-screen max-w-sm mt-5 right-0">
          <div className="bg-white dark:bg-blue-2 rounded p-10">{children}</div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

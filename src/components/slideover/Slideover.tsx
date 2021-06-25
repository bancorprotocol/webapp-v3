import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface SlideoverProps {
  isOpen: boolean;
  setIsOpen: Function;
  children: JSX.Element;
}

export const Slideover = ({ children, setIsOpen, isOpen }: SlideoverProps) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 overflow-hidden z-30"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-grey-4 bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 pr-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              {children}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

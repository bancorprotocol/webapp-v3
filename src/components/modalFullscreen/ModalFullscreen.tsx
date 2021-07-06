import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ModalFullscreenProps {
  children: JSX.Element | JSX.Element[];
  setIsOpen: Function;
  isOpen: boolean;
}

export const ModalFullscreen = ({
  children,
  setIsOpen,
  isOpen,
}: ModalFullscreenProps) => {
  return (
    <>
      <Transition
        appear
        show={isOpen}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto min-w-full min-h-full"
          onClose={() => setIsOpen(false)}
        >
          <div className="inline-block min-w-full min-h-full text-left align-middle transition-all transform bg-white dark:bg-blue-3">
            {children}
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export const BaseModal = ({
  title,
  children,
  setIsOpen,
  isOpen,
}: {
  title: string;
  children: any;
  setIsOpen: Function;
  isOpen: boolean;
}) => {
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
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Dialog.Overlay className="fixed inset-0 bg-blue-3 bg-opacity-70" />
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-30">
              <Dialog.Title as="h5">
                {title}
                {isOpen}
              </Dialog.Title>
              <div className="mt-2">{children}</div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

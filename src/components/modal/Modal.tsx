import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';

interface ModalProps {
  title: string;
  children: JSX.Element;
  setIsOpen: Function;
  isOpen: boolean;
  onBackClick?: Function;
  showBackButton?: boolean;
  onClose?: Function;
}

export const Modal = ({
  title,
  children,
  setIsOpen,
  isOpen,
  showBackButton,
  onBackClick,
  onClose,
}: ModalProps) => {
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
          className="fixed inset-0 z-50"
          onClose={() => (onClose ? onClose() : setIsOpen(false))}
        >
          <div className="min-h-screen px-4 text-center">
            <Dialog.Overlay className="fixed inset-0 bg-blue-3 bg-opacity-70" />
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block w-full max-w-[353px] overflow-hidden align-middle transition-all transform rounded-20 bg-white dark:bg-blue-4 text-left">
              <Dialog.Title className="flex justify-between items-center px-20 text-20 font-semibold h-[60px]">
                {showBackButton ? (
                  <button
                    onClick={() => (onBackClick ? onBackClick() : '')}
                    className="rounded-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <IconChevron className="w-24 transform rotate-180" />
                  </button>
                ) : (
                  ''
                )}

                {title}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-10 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <IconTimes className="w-14" />
                </button>
              </Dialog.Title>
              {children}
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

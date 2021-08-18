import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';

interface ModalProps {
  title?: string;
  children: JSX.Element;
  titleElement?: any;
  setIsOpen: Function;
  isOpen: boolean;
  onBackClick?: Function;
  showBackButton?: boolean;
  onClose?: Function;
}

export const Modal = ({
  title,
  children,
  titleElement,
  setIsOpen,
  isOpen,
  showBackButton,
  onBackClick,
  onClose,
}: ModalProps) => {
  const refDiv = useRef(null);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          initialFocus={refDiv}
          as="div"
          className="fixed inset-0 z-50"
          onClose={() => (onClose ? onClose() : setIsOpen(false))}
        >
          <div ref={refDiv} className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-blue-3 bg-opacity-70" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            ></span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-[353px] overflow-hidden align-middle transition-all transform rounded-20 bg-white dark:bg-blue-4 text-left">
                <Dialog.Title className="flex justify-between items-center px-20 text-20 font-semibold h-[60px]">
                  {showBackButton && (
                    <button
                      onClick={() => onBackClick && onBackClick()}
                      className="rounded-10 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <IconChevron className="w-24 transform rotate-180" />
                    </button>
                  )}

                  {title ? title : titleElement}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-10 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <IconTimes className="w-14" />
                  </button>
                </Dialog.Title>
                {children}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';

interface ModalProps {
  title?: string;
  children: JSX.Element;
  separator?: boolean;
  titleElement?: any;
  setIsOpen: Function;
  isOpen: boolean;
  onBackClick?: Function;
  showBackButton?: boolean;
  onClose?: Function;
  large?: boolean;
}

export const Modal = ({
  title,
  children,
  separator,
  titleElement,
  setIsOpen,
  isOpen,
  showBackButton,
  onBackClick,
  onClose,
  large,
}: ModalProps) => {
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40"
          onClose={() => (onClose ? onClose() : setIsOpen(false))}
        >
          <div className="min-h-screen px-10 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-primary backdrop-filter backdrop-blur bg-opacity-30" />
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
              <div
                className={`inline-block w-full shadow-2xl ${
                  large ? 'max-w-[485px]' : 'max-w-[380px]'
                } overflow-hidden align-middle transition-all transform rounded-40 bg-white dark:bg-charcoal text-left`}
              >
                <Dialog.Title className="flex items-center justify-between mb-20 px-30 text-20 mt-30">
                  {showBackButton && (
                    <button onClick={() => onBackClick && onBackClick()}>
                      <IconChevron className="w-24 transform rotate-180" />
                    </button>
                  )}
                  {titleElement && titleElement}
                  {title ? title : <div>&nbsp;</div>}
                  <div className="w-[80px] flex justify-end">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-5 py-2"
                    >
                      <IconTimes className="w-14" />
                    </button>
                  </div>
                </Dialog.Title>
                <div className="max-h-[80vh] overflow-auto">
                  {separator && <hr className="m-0 widget-separator" />}
                  {children}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

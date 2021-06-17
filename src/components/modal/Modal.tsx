import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import 'components/modal/Modal.css';

interface ModalProps {
  title: string;
  children: JSX.Element;
  setIsOpen: Function;
  isOpen: boolean;
}

export const Modal = ({ title, children, setIsOpen, isOpen }: ModalProps) => {
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
        <Dialog as="div" className="modal" onClose={() => setIsOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Dialog.Overlay className="modal-overlay" />
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="modal-content">
              <Dialog.Title className="modal-title">
                {title}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-10 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <IconTimes className="w-14" />
                </button>
              </Dialog.Title>

              <div className="p-2 max-h-[70vh] overflow-auto">{children}</div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

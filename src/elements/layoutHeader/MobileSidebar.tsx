import { Transition, Dialog } from '@headlessui/react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { Fragment } from 'react';

export const MobileSidebar = ({
  children,
  setShow,
  show,
}: {
  children: JSX.Element;
  setShow: Function;
  show: boolean;
}) => {
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 overflow-hidden z-50"
        open={show}
        onClose={() => setShow(false)}
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
            <Dialog.Overlay className="absolute inset-0 bg-charcoal bg-opacity-50 dark:bg-opacity-70 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 pr-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="fixed right-0 h-full w-[85%]">
                <div className="h-full bg-white dark:bg-black">
                  <div className="flex flex-col justify-between h-full">
                    <div className="overflow-hidden overflow-y-auto">
                      <div className="flex justify-end mx-20 h-[70px]">
                        <button
                          onClick={() => setShow(false)}
                          className="justify-self-right"
                        >
                          <IconTimes className="w-20 align-right" />
                        </button>
                      </div>
                      {children}
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

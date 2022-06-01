import { Transition, Dialog } from '@headlessui/react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconLeft } from 'assets/icons/left.svg';
import { DarkMode } from 'elements/settings/DarkMode';
import { Fragment } from 'react';

export const MobileSidebar = ({
  children,
  setShow,
  show,
  action,
  title,
  showDarkMode = false,
}: {
  children: JSX.Element;
  setShow: Function;
  show: boolean;
  action?: JSX.Element;
  title?: string;
  showDarkMode?: boolean;
}) => {
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 overflow-hidden z-40"
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
              <div className="fixed right-0 flex flex-col h-full w-[85%] px-20 bg-white dark:bg-black">
                <div className="overflow-hidden overflow-y-auto">
                  <div
                    className={`flex items-center ${
                      showDarkMode ? 'justify-between' : 'justify-end'
                    } h-[70px]`}
                  >
                    {showDarkMode && <DarkMode />}
                    <button onClick={() => setShow(false)}>
                      <IconTimes className="w-20 align-right" />
                    </button>
                  </div>
                  {title && (
                    <div className="flex items-center justify-between text-20 mb-40">
                      <div>
                        <button
                          className="mr-10"
                          onClick={() => setShow(false)}
                        >
                          <IconLeft className="w-20" />
                        </button>
                        {title}
                      </div>
                      {action && action}
                    </div>
                  )}
                  {children}
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

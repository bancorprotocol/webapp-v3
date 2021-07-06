import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import 'elements/layoutHeaderMobile/LayoutHeaderMobile.css';

interface ModalFullscreenProps {
  title?: string | JSX.Element | JSX.Element[];
  children: JSX.Element | JSX.Element[];
  setIsOpen: Function;
  isOpen: boolean;
  showHeader?: boolean;
}

export const ModalFullscreen = ({
  title,
  children,
  setIsOpen,
  isOpen,
  showHeader,
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
            {showHeader && (
              <div className="layout-header-mobile mb-20">
                <div className="layout-header-mobile-content text-white">
                  <button onClick={() => setIsOpen(false)}>
                    <IconChevron className="w-[30px] transform rotate-180" />
                  </button>
                  <div className="flex justify-center">
                    <IconBancor className="w-[23px]" />
                  </div>
                </div>
              </div>
            )}

            <main className="px-20">
              {title && (
                <div className="flex justify-between border-b border-grey-2 dark:border-grey-4 pb-10 mb-20 text-20 font-semibold">
                  {title}
                </div>
              )}

              {children}
            </main>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

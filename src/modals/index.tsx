import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { CreatePoolModal } from './CreatePoolModal';
import { DepositDisabledModal } from './DepositDisabledModal';
import { DurationModal } from './DurationModal';
import { DepositETHModal } from './DepositETHModal';
import { SelectPoolModal } from './SelectPoolModal';
import { UpgradeBntModal } from './UpgradeBntModal';
import { UpgradeTknModal } from './UpgradeTknModal';
import { V3BonusesModal } from './V3BonusesModal';
import { V3ExternalHoldingsModal } from './V3ExternalHoldingsModal';
import { V3UnstakeModal } from './V3UnstakeModal';
import { V3WithdrawCancelModal } from './V3WithdrawCancelModal';
import { V3WithdrawConfirmModal } from './V3WithdrawConfirmModal';
import V3WithdrawModal from './V3WithdrawModal';
import { VbntModal } from './VbntModal';
import { V3ManageProgramsModal } from './V3ManageProgramsModal';
import { DepositV3Modal } from './DepositV3Modal';

export enum ModalNames {
  CreatePool,
  DepositDisabled,
  DepositETH,
  DepositV3,
  Duration,
  SelectPool,
  UpgradeBnt,
  UpgradeTkn,
  V3Bonuses,
  V3ExternalHoldings,
  V3ManagePrograms,
  V3Unstake,
  V3WithdrawCancel,
  V3WithdrawConfirm,
  V3Withdraw,
  VBnt,
  WithdrawLiquidity,
}

export const Modals = () => {
  return (
    <>
      <CreatePoolModal />
      <DepositDisabledModal />
      <DepositETHModal />
      <DepositV3Modal />
      <DurationModal />
      <SelectPoolModal />
      <UpgradeBntModal />
      <UpgradeTknModal />
      <V3BonusesModal />
      <V3ExternalHoldingsModal />
      <V3ManageProgramsModal />
      <V3UnstakeModal />
      <V3WithdrawCancelModal />
      <V3WithdrawConfirmModal />
      <V3WithdrawModal />
      <VbntModal />
    </>
  );
};

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
}: {
  title?: string;
  children: JSX.Element;
  separator?: boolean;
  titleElement?: ReactNode;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  onBackClick?: Function;
  showBackButton?: boolean;
  onClose?: Function;
  large?: boolean;
}) => {
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
              <Dialog.Overlay className="fixed inset-0 bg-black backdrop-filter backdrop-blur bg-opacity-70" />
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
                  <div className="flex items-center text-20">
                    {showBackButton && (
                      <button onClick={() => onBackClick && onBackClick()}>
                        <IconChevron className="w-24 transform rotate-180" />
                      </button>
                    )}
                    {title && title}
                  </div>
                  <div className="flex items-center space-x-10">
                    {titleElement && titleElement}
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

export const ModalFullscreen = ({
  isOpen,
  setIsOpen,
  children,
  title,
  titleElement,
  className,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: ReactNode;
  title: string;
  titleElement?: ReactNode;
  className?: string;
}) => {
  return (
    <>
      <Transition
        appear
        show={isOpen}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-0"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-40 overflow-y-auto min-w-full max-h-screen bg-white dark:bg-black"
          onClose={() => setIsOpen(false)}
        >
          <div className="inline-block w-full">
            <header className="fixed top-0 w-full bg-white dark:bg-black h-[70px] flex items-center justify-between px-20">
              <h3 className="flex items-center text-20">
                <IconBancor className="w-20 mr-20" />
                {title}
              </h3>
              <div className="flex items-center space-x-20">
                {titleElement && titleElement}
                <button onClick={() => setIsOpen(false)}>
                  <IconTimes className="w-20" />
                </button>
              </div>
            </header>

            <main
              className={`${className} w-full flex items-center justify-center min-h-[calc(100vh-70px)] space-y-10  pt-[70px] px-20`}
            >
              {children}
            </main>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

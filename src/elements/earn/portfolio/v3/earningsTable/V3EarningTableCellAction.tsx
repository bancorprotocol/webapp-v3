import { Popover, Transition, Portal } from '@headlessui/react';
import { ReactComponent as IconMenuDots } from 'assets/icons/menu-dots.svg';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { Fragment, useRef, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { prettifyNumber } from 'utils/helperFunctions';
import { usePopper } from 'react-popper';

interface Props {
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
}

export const V3EarningTableCellAction = ({ setIsWithdrawModalOpen }: Props) => {
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: 'left-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [10, 0],
        },
      },
    ],
  });

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          {/*@ts-ignore*/}
          <div ref={setTargetElement}>
            <Popover.Button className={`${open ? '' : ''}`}>
              <IconMenuDots className="w-20" />
            </Popover.Button>
          </div>
          <Portal>
            <div
              ref={popperElRef}
              style={styles.popper}
              {...attributes.popper}
              className="z-50"
            >
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
                beforeEnter={() => setPopperElement(popperElRef.current)}
                afterLeave={() => setPopperElement(null)}
              >
                <Popover.Panel className="w-screen max-w-[300px]">
                  <div className="overflow-hidden rounded bg-white p-20 border border-silver h-[280px]">
                    <div className="flex flex-col justify-between h-full">
                      <div className="space-y-20">
                        <div className="flex space-x-20">
                          <Button
                            variant={ButtonVariant.SECONDARY}
                            size={ButtonSize.SMALL}
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="w-full"
                            textBadge="86%"
                          >
                            Deposit
                          </Button>
                          <Button
                            variant={ButtonVariant.SECONDARY}
                            size={ButtonSize.SMALL}
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="w-full"
                          >
                            Withdraw
                          </Button>
                        </div>
                        <button className="flex justify-between w-full">
                          <span>Claim bonuses</span>
                          <span className="text-secondary flex items-center">
                            {prettifyNumber(0.00123123123132)} BNT{' '}
                            <IconChevronRight className="w-16 ml-5" />
                          </span>
                        </button>
                        <button className="flex justify-between w-full">
                          <span>Earning rate</span>
                          <span className="text-secondary flex items-center">
                            32 % <IconChevronRight className="w-16 ml-5" />
                          </span>
                        </button>
                      </div>

                      <hr className="border-silver" />

                      <div className="flex flex-col items-start space-y-14 text-12 text-secondary">
                        <button>Buy ETH with Fiat</button>
                        <button>View Contract</button>
                        <button>Display token on Metamask</button>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </div>
          </Portal>
        </>
      )}
    </Popover>
  );
};

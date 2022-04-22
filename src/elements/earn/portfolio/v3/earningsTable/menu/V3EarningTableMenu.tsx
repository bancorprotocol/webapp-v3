import { Popover, Transition, Portal } from '@headlessui/react';
import { ReactComponent as IconMenuDots } from 'assets/icons/menu-dots.svg';
import { Fragment, memo, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { V3EarningsTableMenuContent } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuContent';
import { Placement } from '@popperjs/core';
import { Holding } from 'store/portfolio/v3Portfolio.types';

export type EarningTableMenuState = 'main' | 'bonus' | 'rate';

interface Props {
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
  holding: Holding;
  setHoldingToWithdraw: (holding: Holding) => void;
  placement?: Placement;
}

export const V3EarningTableMenu = memo(
  ({
    holding,
    setHoldingToWithdraw,
    setIsWithdrawModalOpen,
    placement = 'left-start',
  }: Props) => {
    const popperElRef = useRef(null);
    const [targetElement, setTargetElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(targetElement, popperElement, {
      placement,
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
                      <V3EarningsTableMenuContent
                        holding={holding}
                        setHoldingToWithdraw={setHoldingToWithdraw}
                        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
                      />
                    </div>
                  </Popover.Panel>
                </Transition>
              </div>
            </Portal>
          </>
        )}
      </Popover>
    );
  }
);

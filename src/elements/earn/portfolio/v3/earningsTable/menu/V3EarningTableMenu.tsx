import { Popover, Transition, Portal } from '@headlessui/react';
import { ReactComponent as IconMenuDots } from 'assets/icons/menu-dots.svg';
import { Fragment, memo, useCallback, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { V3EarningsTableMenuContent } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuContent';
import { Placement } from '@popperjs/core';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { expandToken } from 'utils/formulas';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'store';
import { useDispatch } from 'react-redux';

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
    const { standardStakingReward } = holding;
    const account = useAppSelector((state) => state.user.account);
    const dispatch = useDispatch();
    const [txJoinBusy, setTxJoinBusy] = useState(false);

    const handleJoinClick = async () => {
      if (!standardStakingReward || !account) {
        console.error('standardStakingReward is not defined');
        return;
      }

      try {
        const tx = await ContractsApi.StandardRewards.write.join(
          standardStakingReward.id,
          expandToken(holding.poolTokenBalance, 18)
        );
        await tx.wait();
        await updatePortfolioData(dispatch, account);
        setTxJoinBusy(false);
      } catch (e) {
        console.error('handleJoinClick', e);
        setTxJoinBusy(false);
      }
    };

    const [onStart, ApproveModal] = useApproveModal(
      [
        {
          amount: holding.poolTokenBalance,
          token: {
            ...holding.pool.reserveToken,
            address: holding.pool.poolTokenDltId,
            decimals: 18,
            symbol: `bn${holding.pool.reserveToken.symbol}`,
          },
        },
      ],
      handleJoinClick,
      ContractsApi.StandardRewards.contractAddress
    );

    const onStartJoin = useCallback(() => {
      setTxJoinBusy(true);
      onStart();
    }, [onStart]);

    return (
      <>
        {ApproveModal}
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
                      <div className="overflow-hidden rounded bg-white dark:bg-black p-20 border border-silver dark:border-grey h-[280px]">
                        <V3EarningsTableMenuContent
                          holding={holding}
                          setHoldingToWithdraw={setHoldingToWithdraw}
                          setIsWithdrawModalOpen={setIsWithdrawModalOpen}
                          onStartJoin={onStartJoin}
                          txJoinBusy={txJoinBusy}
                        />
                      </div>
                    </Popover.Panel>
                  </Transition>
                </div>
              </Portal>
            </>
          )}
        </Popover>
      </>
    );
  }
);

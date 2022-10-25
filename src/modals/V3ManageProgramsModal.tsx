import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { expandToken, shrinkToken } from 'utils/formulas';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  confirmJoinNotification,
  confirmLeaveNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { ReactComponent as IconClock } from 'assets/icons/time.svg';
import { useTknFiatInput } from 'elements/trade/useTknFiatInput';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useApproval } from 'hooks/useApproval';
import { Modal, ModalNames } from 'modals';
import { useModal } from 'hooks/useModal';
import { getIsModalOpen, getModalData } from 'store/modals/modals';

interface V3ManageProgramsProps {
  holding: Holding;
}

export const V3ManageProgramsModal = () => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const [txBusy, setTxBusy] = useState(false);
  const [joinRewards, setJoinRewards] = useState(false);
  const [amount, setAmount] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const [txJoinBusy, setTxJoinBusy] = useState(false);
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.V3ManagePrograms)
  );

  const props = useAppSelector<V3ManageProgramsProps | undefined>((state) =>
    getModalData(state, ModalNames.V3ManagePrograms)
  );

  const holding = props?.holding;

  const tokenInputField = useTknFiatInput({
    token: holding && {
      ...holding.pool.reserveToken,
      symbol: `bn${holding.pool.name}`,
      balance: holding.poolTokenBalance,
      balanceUsd: toBigNumber(holding.tokenBalance)
        .times(holding.pool.reserveToken.usdPrice)
        .toNumber(),
      usdPrice: toBigNumber(holding.tokenBalance)
        .times(holding.pool.reserveToken.usdPrice)
        .div(holding.poolTokenBalance)
        .toString(),
    },
    setInputTkn: setAmount,
    setInputFiat: setInputFiat,
    inputTkn: amount,
    inputFiat: inputFiat,
  });

  const inputErrorMsg = useMemo(
    () =>
      !!account && new BigNumber(holding?.poolTokenBalance || 0).lt(amount)
        ? 'Insufficient balance'
        : '',
    [account, amount, holding?.poolTokenBalance]
  );

  const onClose = async () => {
    popModal();
    setJoinRewards(false);
    setAmount('');
    setInputFiat('');
  };

  const programs = holding
    ? holding.programs.filter((p) => toBigNumber(p.tokenAmountWei).gt(0))
    : [];

  const programsMerged = programs.map((p) => ({
    ...p,
    ...holding?.pool.programs.find((pp) => pp.id === p.id),
  }));

  const programsSorted = programsMerged.sort((a, _) => (a.isActive ? 0 : -1));

  const handleJoinClick = async () => {
    if (!holding?.pool.latestProgram?.isActive || !account) {
      console.error('rewardProgram is not defined or inactive');
      return;
    }

    if (amount === '' || !holding) {
      return;
    }

    try {
      const tx = await ContractsApi.StandardRewards.write.join(
        holding.pool.latestProgram?.id,
        expandToken(amount, holding.pool.decimals)
      );
      confirmJoinNotification(
        dispatch,
        tx.hash,
        amount,
        `bn${holding.pool.reserveToken.symbol}`
      );
      setTxJoinBusy(false);
      setJoinRewards(false);
      setAmount('');
      setInputFiat('');
      await tx.wait();
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      console.error('handleJoinClick', e);
      setTxJoinBusy(false);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    }
  };

  const startApprove = useApproval(
    holding
      ? [
          {
            amount: expandToken(amount, holding.pool.decimals),
            token: {
              ...holding.pool.reserveToken,
              address: holding.pool.poolTokenDltId,
              symbol: `bn${holding.pool.reserveToken.symbol}`,
            },
          },
        ]
      : [],
    handleJoinClick,
    ContractsApi.StandardRewards.contractAddress
  );

  const onStartJoin = useCallback(() => {
    setTxJoinBusy(true);
    startApprove();
  }, [startApprove]);

  if (!holding) return null;

  const handleLeaveClick = async (
    id: string,
    poolTokenAmountWei: string,
    tokenAmountWei: string
  ) => {
    if (!account) {
      console.error('handleLeaveClick because arguments are not defined');
      return;
    }
    try {
      setTxBusy(true);
      const tx = await ContractsApi.StandardRewards.write.leave(
        id,
        poolTokenAmountWei
      );
      confirmLeaveNotification(
        dispatch,
        tx.hash,
        shrinkToken(tokenAmountWei, holding.pool.decimals),
        holding.pool.reserveToken.symbol
      );
      onClose();
      setTxBusy(false);
      await tx.wait();
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      console.error('handleLeaveClick', e);
      onClose();
      setTxBusy(false);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      } else {
        genericFailedNotification(dispatch, 'Leave rewards failed');
      }
    }
  };

  return (
    <Modal
      title={joinRewards ? 'Rewards' : 'Manage Rewards'}
      setIsOpen={onClose}
      isOpen={isOpen}
      showBackButton={joinRewards}
      onBackClick={() => setJoinRewards(false)}
      separator
      large
    >
      {joinRewards ? (
        <div className="flex flex-col gap-20 p-30">
          <div className="text-22">Join BNT rewards</div>
          <TradeWidgetInput
            label={'Amount'}
            input={tokenInputField}
            errorMsg={inputErrorMsg}
            disableSelection
          />
          <div className="flex justify-between text-black-medium dark:text-white-medium mt-10">
            <div>BNT Rewards</div>
            <div className="flex flex-col items-end">
              {holding.pool.apr7d.total.toFixed(2)}%
              <div className="text-secondary">
                {dayjs(
                  (holding.pool.latestProgram?.endTime ?? 0) * 1000
                ).format('MMM D, YYYY')}
              </div>
            </div>
          </div>
          <Button
            disabled={txJoinBusy || !!inputErrorMsg || !amount}
            onClick={() => onStartJoin()}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Full}
          >
            Add bn{holding.pool.reserveToken.symbol} to rewards program
          </Button>
        </div>
      ) : (
        <div className="px-30 pb-30 pt-10">
          <div className="text-secondary mb-48">
            Earn BNT rewards on your bn{holding.pool.reserveToken.symbol}, there
            are no cooldowns or withdrawal fees for adding or removing bnETH to
            reward programs
          </div>

          <div className="text-secondary">
            Available bn{holding.pool.reserveToken.symbol}
            <div className="flex items-center justify-between mt-30">
              <div>
                <div className="text-black text-20 dark:text-white">
                  {prettifyNumber(
                    new BigNumber(holding.tokenBalance).times(
                      holding.pool.reserveToken.usdPrice
                    ),
                    true
                  )}
                </div>
                <div>
                  {prettifyNumber(holding.poolTokenBalance)} bn
                  {holding.pool.reserveToken.symbol}
                </div>
              </div>
              {holding.pool.latestProgram?.isActive && (
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  onClick={() => setJoinRewards(true)}
                >
                  Join Rewards
                </Button>
              )}
            </div>
          </div>
          {programsSorted.length > 0 && (
            <hr className="my-30 border-silver dark:border-grey" />
          )}
          {programsSorted.length > 0 && (
            <>
              <div className="text-secondary mb-30">
                bn{holding.pool.reserveToken.symbol} in BNT Rewards
              </div>

              <div>
                {programsSorted.map((program) => (
                  <div key={program.id}>
                    <div className="flex items-center justify-between text-secondary">
                      <div>
                        <div className="text-black text-20 dark:text-white">
                          {prettifyNumber(
                            new BigNumber(
                              shrinkToken(
                                program.tokenAmountWei,
                                holding.pool.decimals
                              )
                            ).times(holding.pool.reserveToken.usdPrice),
                            true
                          )}
                        </div>
                        <div>
                          {prettifyNumber(
                            shrinkToken(
                              program.poolTokenAmountWei,
                              holding.pool.decimals
                            )
                          )}{' '}
                          bn{holding.pool.reserveToken.symbol}
                        </div>
                      </div>
                      {program.isActive ? (
                        <div className="text-secondary">
                          <div className="text-primary">
                            {holding.pool.apr7d.standardRewards.toFixed(2)}% APR
                          </div>
                          <div className="flex items-center gap-5">
                            <IconClock />
                            {dayjs((program.startTime ?? 0) * 1000).format(
                              'MMM D, YYYY'
                            )}{' '}
                            -{' '}
                            {dayjs((program.endTime ?? 0) * 1000).format(
                              'MMM D, YYYY'
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-secondary text-16">Inactive</div>
                      )}
                      <Button
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.ExtraSmall}
                        disabled={txBusy}
                        onClick={() =>
                          handleLeaveClick(
                            program.id,
                            program.poolTokenAmountWei,
                            program.tokenAmountWei
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

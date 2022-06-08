import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { useAppSelector } from 'store/index';
import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { expandToken } from 'utils/formulas';
import {
  confirmJoinNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { useApproveModal } from 'hooks/useApproveModal';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import V3WithdrawModal from 'elements/earn/portfolio/v3/initWithdraw/V3WithdrawModal';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const V3HoldingsItemUnstaked = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const isDisabled = toBigNumber(holding.tokenBalance).isZero();

  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const [txJoinBusy, setTxJoinBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleJoinClick = async () => {
    if (!pool.latestProgram || !account) {
      console.error('rewardProgram is not defined');
      return;
    }

    try {
      const tx = await ContractsApi.StandardRewards.write.join(
        pool.latestProgram.id,
        expandToken(holding.poolTokenBalance, pool.decimals)
      );
      confirmJoinNotification(
        dispatch,
        tx.hash,
        holding.tokenBalance,
        holding.pool.reserveToken.symbol
      );
      await tx.wait();
      await updatePortfolioData(dispatch);
      setTxJoinBusy(false);
    } catch (e: any) {
      console.error('handleJoinClick', e);
      setTxJoinBusy(false);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    [
      {
        amount: holding.poolTokenBalance,
        token: {
          ...holding.pool.reserveToken,
          address: holding.pool.poolTokenDltId,
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
      <V3WithdrawModal
        holding={holding}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div>
        <div className="text-secondary">Available Balance</div>
        <div className="flex items-center space-x-10 pt-6">
          <PopoverV3
            buttonElement={() => (
              <div
                className={`mb-10 text-18 ${
                  isDisabled ? 'text-secondary' : ''
                }`}
              >
                {prettifyNumber(holding.tokenBalance)}{' '}
                {pool.reserveToken.symbol}
              </div>
            )}
          >
            {holding.tokenBalance} {pool.reserveToken.symbol}
          </PopoverV3>

          <div className={`mb-10 text-secondary`}>
            ({prettifyNumber(holding.poolTokenBalance)} bn
            {pool.reserveToken.symbol})
          </div>
        </div>

        <div className="flex space-x-10">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            disabled={isDisabled}
            onClick={() => setIsOpen(true)}
          >
            Withdraw
          </Button>

          {holding.pool.latestProgram?.isActive && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              disabled={isDisabled || txJoinBusy}
              onClick={onStartJoin}
            >
              Join Rewards
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

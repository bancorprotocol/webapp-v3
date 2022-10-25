import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { useAppSelector } from 'store/index';
import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { expandToken } from 'utils/formulas';
import {
  confirmJoinNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useModal } from 'hooks/useModal';
import { ModalNames } from 'modals';
import { useApproval } from 'hooks/useApproval';

export const V3HoldingsItemUnstaked = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const isDisabled = toBigNumber(holding.tokenBalance).isZero();
  const { pushModal } = useModal();

  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const [txJoinBusy, setTxJoinBusy] = useState(false);

  const handleJoinClick = async () => {
    if (!pool.latestProgram?.isActive || !account) {
      console.error('rewardProgram is not defined or active');
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
      } else {
        genericFailedNotification(dispatch, 'Joining rewards failed');
      }
    }
  };

  const startApprove = useApproval(
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
    startApprove();
  }, [startApprove]);

  return (
    <>
      <div>
        <div className="text-secondary">Available Balance</div>
        <div className="flex items-center pt-6 space-x-10">
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
            onClick={() =>
              pushModal({
                modalName: ModalNames.V3Withdraw,
                data: { holding },
              })
            }
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

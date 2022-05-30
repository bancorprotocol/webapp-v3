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

export const V3HoldingsItemUnstaked = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const isDisabled = toBigNumber(holding.tokenBalance).isZero();

  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const [txJoinBusy, setTxJoinBusy] = useState(false);

  const handleJoinClick = async () => {
    if (!holding.pool.latestProgram || !account) {
      console.error('rewardProgram is not defined');
      return;
    }

    try {
      const tx = await ContractsApi.StandardRewards.write.join(
        holding.pool.latestProgram.id,
        expandToken(holding.poolTokenBalance, 18)
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
      <div>
        <div className="text-secondary">
          {`bn${pool.reserveToken.symbol}`} in Wallet (not joined to rewards)
        </div>
        <div className={`mt-6 mb-10 ${isDisabled ? 'text-secondary' : ''}`}>
          {prettifyNumber(holding.poolTokenBalance)}{' '}
          {`bn${pool.reserveToken.symbol}`}
        </div>
        <div className="flex justify-center">
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.EXTRASMALL}
            disabled={isDisabled || txJoinBusy}
            onClick={onStartJoin}
          >
            Join
          </Button>
        </div>
      </div>
    </>
  );
};

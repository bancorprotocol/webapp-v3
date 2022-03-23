import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { useAppSelector } from 'redux/index';
import { getPortfolioWithdrawalRequests } from 'redux/portfolio/v3Portfolio';
import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ErrorCode } from 'services/web3/types';
import {
  rejectNotification,
  withdrawCancelNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';

const WithdrawAvailableItem = ({
  withdrawalRequest,
}: {
  withdrawalRequest: WithdrawalRequest;
}) => {
  const dispatch = useDispatch();
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );

  const { token, lockEndsAt, reserveTokenAmount } = withdrawalRequest;
  const isLocked = useMemo(() => lockEndsAt - dayjs().unix() < 0, [lockEndsAt]);

  const withdraw = async () => {
    const res = await ContractsApi.BancorNetwork.write.withdraw(
      withdrawalRequest.id
    );
    console.log(res);
  };

  const cancelWithdrawal = async () => {
    try {
      const tx = await ContractsApi.BancorNetwork.write.cancelWithdrawal(
        withdrawalRequest.id
      );
      withdrawCancelNotification(
        dispatch,
        tx.hash,
        reserveTokenAmount,
        token.symbol
      );
      await tx.wait();
      await updatePortfolioData(dispatch, account!);
    } catch (e: any) {
      console.error('cancelWithdrawal failed: ', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    }
  };

  return (
    <div className="flex justify-between items-center">
      <TokenBalance
        symbol={token.symbol}
        amount={withdrawalRequest.reserveTokenAmount}
        usdPrice={token.usdPrice ?? '0'}
        imgUrl={token.logoURI}
      />
      <div className="flex items-center space-x-14">
        {isLocked && (
          <Button
            onClick={withdraw}
            size={ButtonSize.EXTRASMALL}
            variant={ButtonVariant.SECONDARY}
          >
            Withdraw
          </Button>
        )}
        {!isLocked && (
          <div className="text-secondary text-12 text-right">
            Cooling down
            <CountdownTimer date={lockEndsAt * 1000} />
          </div>
        )}
        <button onClick={cancelWithdrawal} className="hover:text-error p-10">
          <IconTimes className="w-10" />
        </button>
      </div>
    </div>
  );
};

export const V3Withdraw = () => {
  const withdrawalRequests = useAppSelector(getPortfolioWithdrawalRequests);
  const isLoadingWithdrawalRequests = useAppSelector(
    (state) => state.v3Portfolio.isLoadingWithdrawalRequests
  );

  return (
    <section className="content-block p-14">
      <h2 className="text-12 text-secondary font-normal mb-10">
        Pending Withdrawals
      </h2>
      <div className="space-y-10">
        {withdrawalRequests.map((withdrawalRequest) => (
          <WithdrawAvailableItem
            withdrawalRequest={withdrawalRequest}
            key={withdrawalRequest.id}
          />
        ))}
        {isLoadingWithdrawalRequests &&
          [...Array(5)].map((_, index) => (
            <div className="loading-skeleton w-full h-[30px]" />
          ))}
      </div>
      {withdrawalRequests.length === 0 && !isLoadingWithdrawalRequests && (
        <div className="text-center text-primary text-12 py-20">
          No pending withdrawals
        </div>
      )}
    </section>
  );
};

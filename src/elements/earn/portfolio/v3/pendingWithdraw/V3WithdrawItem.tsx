import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { useDateNow } from 'hooks/useDateNow';
import { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';

interface Props {
  withdrawalRequest: WithdrawalRequest;
  openCancelModal: (req: WithdrawalRequest) => void;
  openConfirmModal: (req: WithdrawalRequest) => void;
}

export const WithdrawItem = memo(
  ({ withdrawalRequest, openCancelModal, openConfirmModal }: Props) => {
    const dateNow = useDateNow();
    const { lockEndsAt } = withdrawalRequest;
    const token = withdrawalRequest.pool.reserveToken;
    const isLocked = useMemo(
      () => lockEndsAt - dayjs(dateNow).unix() <= 0,
      [dateNow, lockEndsAt]
    );

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
              onClick={() => openConfirmModal(withdrawalRequest)}
              size={ButtonSize.ExtraSmall}
              variant={ButtonVariant.Secondary}
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
          <button
            onClick={() => openCancelModal(withdrawalRequest)}
            className="hover:text-error p-10"
          >
            <IconTimes className="w-10" />
          </button>
        </div>
      </div>
    );
  }
);

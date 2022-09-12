import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { useDateNow } from 'hooks/useDateNow';
import { memo, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { expandToken, shrinkToken } from 'utils/formulas';
import { bntToken } from 'services/web3/config';

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
    const [withdrawAmounts, setWithdrawAmounts] = useState<{
      tkn: number;
      bnt: number;
      totalAmount: string;
      baseTokenAmount: string;
      bntAmount: string;
    }>();

    useAsyncEffect(async () => {
      const res = await fetchWithdrawalRequestOutputBreakdown(
        withdrawalRequest.reserveToken,
        expandToken(
          withdrawalRequest.poolTokenAmount,
          withdrawalRequest.pool.reserveToken.decimals
        ),
        expandToken(
          withdrawalRequest.reserveTokenAmount,
          withdrawalRequest.pool.reserveToken.decimals
        )
      );
      setWithdrawAmounts(res);
    }, [withdrawalRequest]);

    const isBNT = withdrawalRequest.pool.poolDltId === bntToken;

    const deficitAmount =
      isBNT || !withdrawAmounts
        ? undefined
        : shrinkToken(withdrawAmounts.baseTokenAmount, token.decimals);

    return (
      <div className="flex items-center justify-between">
        <TokenBalance
          symbol={token.symbol}
          amount={withdrawalRequest.reserveTokenAmount}
          usdPrice={token.usdPrice ?? '0'}
          imgUrl={token.logoURI}
          deficitAmount={deficitAmount}
          abbreviate
        />
        <div className="flex items-center space-x-5">
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
            <div className="text-right text-secondary text-12">
              Cooling down
              <CountdownTimer date={lockEndsAt * 1000} />
            </div>
          )}
          <button
            onClick={() => openCancelModal(withdrawalRequest)}
            className="p-10 hover:text-error"
          >
            <IconTimes className="w-10" />
          </button>
        </div>
      </div>
    );
  }
);

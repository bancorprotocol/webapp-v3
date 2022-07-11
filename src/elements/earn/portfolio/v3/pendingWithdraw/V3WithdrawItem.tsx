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
    const [outputBreakdown, setOutputBreakdown] = useState({
      tkn: 0,
      bnt: 0,
      totalAmount: '0',
      baseTokenAmount: '0',
      bntAmount: '0',
    });

    useAsyncEffect(async () => {
      const res = await fetchWithdrawalRequestOutputBreakdown(
        withdrawalRequest.reserveToken,
        expandToken(
          withdrawalRequest.poolTokenAmount,
          withdrawalRequest.pool.reserveToken.decimals
        )
      );
      if (res) setOutputBreakdown(res);
    }, [withdrawalRequest]);

    const isBNT = withdrawalRequest.pool.poolDltId === bntToken;

    const defecitAmount = isBNT
      ? undefined
      : shrinkToken(outputBreakdown.baseTokenAmount, token.decimals);

    return (
      <div className="flex justify-between items-center">
        <TokenBalance
          symbol={token.symbol}
          amount={withdrawalRequest.reserveTokenAmount}
          usdPrice={token.usdPrice ?? '0'}
          imgUrl={token.logoURI}
          defecitAmount={defecitAmount}
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

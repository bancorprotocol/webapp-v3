import { useRef, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { Token } from 'services/observables/tokens';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { WithdrawLiquidityInfo } from './WithdrawLiquidityInfo';
import { LinePercentage } from 'components/linePercentage/LinePercentage';
import { Modal } from 'components/modal/Modal';
import {
  getWithdrawBreakdown,
  ProtectedPosition,
  withdrawProtection,
} from 'services/web3/protection/positions';
import { checkPriceDeviationTooHigh } from 'services/web3/liquidity/liquidity';
import { useApproveModal } from 'hooks/useApproveModal';
import { liquidityProtection$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import { EthNetworks } from 'services/web3/types';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';
import { useDebounce } from 'hooks/useDebounce';
import BigNumber from 'bignumber.js';
import {
  withdrawProtectedPosition,
  rejectNotification,
  withdrawProtectedPositionFailed,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';

interface Props {
  protectedPosition: ProtectedPosition;
  isModalOpen: boolean;
  setIsModalOpen: Function;
}

export const WithdrawLiquidityWidget = ({
  protectedPosition,
  isModalOpen,
  setIsModalOpen,
}: Props) => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch();
  const { positionId, reserveToken, currentCoveragePercent, pool } =
    protectedPosition;
  const { tknAmount } = protectedPosition.claimableAmount;
  const [amount, setAmount] = useState('');
  const [amountDebounce, setAmountebounce] = useDebounce('');
  const [isPriceDeviationToHigh, setIsPriceDeviationToHigh] = useState(false);
  const approveContract = useRef('');
  const token = useAppSelector<Token | undefined>(
    getTokenById(reserveToken.address)
  );
  const [breakdown, setBreakdown] = useState<
    { tkn: number; bnt: number } | undefined
  >();
  const gov = getNetworkVariables(
    chainId ? chainId : EthNetworks.Mainnet
  ).govToken;
  const govToken = useAppSelector<Token | undefined>(getTokenById(gov));
  const bnt = bntToken(chainId ?? EthNetworks.Mainnet);

  const withdrawingBNT = reserveToken.address === bnt;
  const protectionNotReached = currentCoveragePercent !== 1;
  const multiplierWillReset = true;
  const emtpyAmount = amount.trim() === '' || Number(amount) === 0;
  const withdrawDisabled = amount > tknAmount || emtpyAmount;

  useAsyncEffect(async (isMounted) => {
    if (isMounted())
      approveContract.current = await liquidityProtection$
        .pipe(take(1))
        .toPromise();
  }, []);

  const showVBNTWarning = () => {
    if (!amount) {
      return false;
    }
    const isBalanceSufficient = new BigNumber(
      govToken ? govToken.balance ?? 0 : 0
    ).gte(amount);
    if (isBalanceSufficient) {
      return false;
    }

    return new BigNumber(govToken ? govToken.balance ?? 0 : 0).lt(
      protectedPosition.initialStake.tknAmount
    );
  };

  useAsyncEffect(
    async (isMounted) => {
      const isPriceDeviationToHigh = await checkPriceDeviationTooHigh(
        pool,
        token!
      );
      setIsPriceDeviationToHigh(isPriceDeviationToHigh);

      if (isMounted()) {
        if (withdrawDisabled || withdrawingBNT) return;
        const res = await getWithdrawBreakdown(
          positionId,
          amountDebounce,
          tknAmount
        );

        if (res.bntAmount === '0') setBreakdown(undefined);
        else {
          const percentage = new BigNumber(res.actualAmount)
            .div(res.expectedAmount)
            .toNumber();

          setBreakdown({ tkn: percentage, bnt: 1 - percentage });
        }
      }
    },
    [amountDebounce]
  );

  const withdraw = async () => {
    if (token)
      await withdrawProtection(
        positionId,
        amount,
        tknAmount,
        (txHash: string) =>
          withdrawProtectedPosition(dispatch, token, amount, txHash),
        () => {},
        () => rejectNotification(dispatch),
        () => withdrawProtectedPositionFailed(dispatch, token, amount)
      );
    setIsModalOpen(false);
  };

  const [onStart, ModalApprove] = useApproveModal(
    [{ amount: amount, token: govToken! }],
    withdraw,
    approveContract.current
  );

  const handleWithdraw = async () => {
    if (withdrawingBNT) onStart();
    else withdraw();
  };

  return (
    <>
      <Modal
        setIsOpen={setIsModalOpen}
        isOpen={isModalOpen}
        title="Withdraw Protection"
      >
        <div className="px-20 pb-20">
          <WithdrawLiquidityInfo
            protectionNotReached={protectionNotReached}
            multiplierWillReset={multiplierWillReset}
          />
          <div className="my-20">
            <TokenInputPercentage
              label="Amount"
              token={token}
              debounce={setAmountebounce}
              balance={tknAmount}
              amount={amount}
              setAmount={setAmount}
            />
          </div>
          {breakdown && (
            <div className="flex justify-between items-center mt-20">
              <div>Output breakdown</div>
              <div className="relative w-[180px]">
                <LinePercentage
                  percentages={[
                    {
                      color: 'blue-4',
                      decPercent: breakdown.tkn,
                      label: token?.symbol,
                    },
                    {
                      color: 'primary',
                      decPercent: breakdown.bnt,
                      label: 'BNT',
                    },
                  ]}
                />
              </div>
            </div>
          )}
          {withdrawingBNT && (
            <div className="mt-20">
              BNT withdrawals are subject to a 24h lock period before they can
              be claimed.
            </div>
          )}
          {isPriceDeviationToHigh && (
            <div className="p-20 rounded bg-error font-medium mt-20 text-white">
              Due to price volatility, withdrawing from your protected position
              is currently not available. Please try again in a few minutes.
            </div>
          )}
          {showVBNTWarning() && (
            <div className="p-20 rounded bg-error font-medium mt-20 text-white">
              Insufficient VBNT balance.
            </div>
          )}
          <button
            onClick={() => handleWithdraw()}
            disabled={withdrawDisabled}
            className={`btn-primary rounded w-full mt-20`}
          >
            {emtpyAmount ? 'Enter Amount' : 'Withdraw'}
          </button>
        </div>
      </Modal>
      {ModalApprove}
    </>
  );
};

import { useCallback, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { Pool, Token } from 'services/observables/tokens';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { WithdrawLiquidityInfo } from './WithdrawLiquidityInfo';
import { LinePercentage } from 'components/linePercentage/LinePercentage';
import { Modal } from 'components/modal/Modal';
import {
  fetchProtectedPositions,
  getWithdrawBreakdown,
  ProtectedPosition,
  withdrawProtection,
} from 'services/web3/protection/positions';
import { checkPriceDeviationTooHigh } from 'services/web3/liquidity/liquidity';
import { useApproveModal } from 'hooks/useApproveModal';
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
import { setProtectedPositions } from 'redux/liquidity/liquidity';
import { SwapSwitch } from '../../../swapSwitch/SwapSwitch';
import { wait } from '../../../../utils/pureFunctions';
import { ApprovalContract } from 'services/web3/approval';

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
  const dispatch = useDispatch();
  const { chainId, account } = useWeb3React();
  const { positionId, reserveToken, currentCoveragePercent, pool } =
    protectedPosition;
  const { tknAmount } = protectedPosition.claimableAmount;
  const [amount, setAmount] = useState('');
  const [amountDebounce, setAmountebounce] = useDebounce('');
  const [isPriceDeviationToHigh, setIsPriceDeviationToHigh] = useState(false);
  const token = useAppSelector<Token | undefined>(
    getTokenById(reserveToken.address)
  );
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);
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
  const tokenInsufficent = Number(amount) > Number(tknAmount);
  const withdrawDisabled = emtpyAmount || tokenInsufficent;

  const showVBNTWarning = useCallback(() => {
    if (token && token.address !== bnt) {
      return false;
    }
    if (!amount) {
      return false;
    }
    const govTokenBalance = govToken ? govToken.balance ?? 0 : 0;
    const initalStake = protectedPosition.initialStake.tknAmount;
    return new BigNumber(amount)
      .div(tknAmount)
      .times(initalStake)
      .gt(govTokenBalance);
  }, [
    amount,
    bnt,
    govToken,
    protectedPosition.initialStake.tknAmount,
    tknAmount,
    token,
  ]);

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

  const withdraw = useCallback(async () => {
    if (token)
      await withdrawProtection(
        positionId,
        amount,
        tknAmount,
        (txHash: string) => {
          withdrawProtectedPosition(dispatch, token, amount, txHash);
          setIsModalOpen(false);
        },
        async () => {
          const positions = await fetchProtectedPositions(pools, account!);
          dispatch(setProtectedPositions(positions));
        },
        () => rejectNotification(dispatch),
        () => withdrawProtectedPositionFailed(dispatch, token, amount)
      );
    setIsModalOpen(false);
  }, [
    account,
    amount,
    dispatch,
    pools,
    positionId,
    setIsModalOpen,
    tknAmount,
    token,
  ]);

  const [onStart, ModalApprove] = useApproveModal(
    [{ amount: amount, token: govToken! }],
    withdraw,
    ApprovalContract.LiquidityProtection
  );

  const handleWithdraw = useCallback(async () => {
    if (withdrawingBNT) {
      setIsModalOpen(false);
      await wait(1000);
      onStart();
    } else withdraw();
  }, [onStart, setIsModalOpen, withdraw, withdrawingBNT]);

  return (
    <>
      <Modal
        setIsOpen={setIsModalOpen}
        isOpen={isModalOpen}
        title="Withdraw"
        large
        titleElement={<SwapSwitch />}
      >
        <div className="px-20 pb-20">
          <WithdrawLiquidityInfo
            protectionNotReached={protectionNotReached}
            multiplierWillReset={multiplierWillReset}
          />
          <div className="my-20">
            <TokenInputPercentage
              label="Pool"
              token={token}
              debounce={setAmountebounce}
              balance={tknAmount}
              amount={amount}
              errorMsg={
                tokenInsufficent
                  ? 'Token balance is currently insufficient'
                  : undefined
              }
              setAmount={setAmount}
              balanceLabel="Claimable amount"
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
              Insufficient vBNT balance.
            </div>
          )}
          <button
            onClick={handleWithdraw}
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

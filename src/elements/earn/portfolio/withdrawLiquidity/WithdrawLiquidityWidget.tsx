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
import {
  ConversionEvents,
  sendLiquidityApprovedEvent,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from '../../../../services/api/googleTagManager';

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
  const { chainId } = useWeb3React();
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );
  const { positionId, reserveToken, currentCoveragePercent, pool } =
    protectedPosition;
  const { tknAmount } = protectedPosition.claimableAmount;
  const [amount, setAmount] = useState('');
  const [amountDebounce, setAmountebounce] = useDebounce('');
  const [isPriceDeviationToHigh, setIsPriceDeviationToHigh] = useState(false);
  const token = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, reserveToken.address)
  );
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);
  const [breakdown, setBreakdown] = useState<
    { tkn: number; bnt: number } | undefined
  >();
  const gov = getNetworkVariables(
    chainId ? chainId : EthNetworks.Mainnet
  ).govToken;
  const govToken = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, gov)
  );
  const bnt = bntToken(chainId ?? EthNetworks.Mainnet);

  const withdrawingBNT = reserveToken.address === bnt;
  const protectionNotReached = currentCoveragePercent !== 1;
  const multiplierWillReset = true;
  const emtpyAmount = amount.trim() === '' || Number(amount) === 0;
  const tokenInsufficent = Number(amount) > Number(tknAmount);
  const withdrawDisabled = emtpyAmount || tokenInsufficent;
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);

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
    if (token) {
      let transactionId: string;
      await withdrawProtection(
        positionId,
        amount,
        tknAmount,
        (txHash: string) => {
          transactionId = txHash;
          withdrawProtectedPosition(dispatch, token, amount, txHash);
          setIsModalOpen(false);
        },
        async () => {
          sendLiquiditySuccessEvent(transactionId);
          const positions = await fetchProtectedPositions(pools, account!);
          dispatch(setProtectedPositions(positions));
        },
        () => {
          sendLiquidityFailEvent('User rejected transaction');
          rejectNotification(dispatch);
        },
        (errorMsg) => {
          sendLiquidityFailEvent(errorMsg);
          withdrawProtectedPositionFailed(dispatch, token, amount);
        }
      );
    }
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
    govToken ? [{ amount: amount, token: govToken }] : [],
    withdraw,
    ApprovalContract.LiquidityProtection,
    sendLiquidityEvent,
    sendLiquidityApprovedEvent
  );

  const handleWithdraw = useCallback(async () => {
    const amountUsd = new BigNumber(amount)
      .times(token ? token.usdPrice ?? 0 : 0)
      .toString();
    setCurrentLiquidity(
      'Withdraw Single',
      chainId,
      pool.name,
      token!.symbol,
      amount,
      amountUsd,
      undefined,
      undefined,
      fiatToggle
    );
    sendLiquidityEvent(ConversionEvents.click);
    if (withdrawingBNT) {
      setIsModalOpen(false);
      await wait(1000);
      onStart();
    } else withdraw();
  }, [
    amount,
    chainId,
    fiatToggle,
    onStart,
    pool.name,
    setIsModalOpen,
    token,
    withdraw,
    withdrawingBNT,
  ]);

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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { expandToken, shrinkToken } from 'utils/formulas';
import {
  initWithdrawNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';

interface Props {
  holding: Holding;
  amount: AmountTknFiat;
  setStep: (step: number) => void;
}

export const useV3WithdrawStep3 = ({ holding, amount, setStep }: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const [txBusy, setTxBusy] = useState(false);
  const hasStarted = useRef(false);
  const { pool } = holding;
  const { reserveToken, poolDltId, poolTokenDltId, decimals } = pool;

  const [poolTokenAmountWei, setPoolTokenAmountWei] = useState('0');

  const approveTokens = useMemo(
    () => [
      {
        amount: shrinkToken(poolTokenAmountWei, reserveToken.decimals),
        token: {
          ...reserveToken,
          address: poolTokenDltId,
          symbol: `bn${reserveToken.symbol}`,
        },
      },
    ],
    [poolTokenAmountWei, poolTokenDltId, reserveToken]
  );

  const setWithdrawalAmountWei = useCallback(async (): Promise<void> => {
    if (!account) {
      console.error('No account, please connect wallet');
      return;
    }
    try {
      const currentPoolTokenBalanceWei = await ContractsApi.Token(
        poolTokenDltId
      ).read.balanceOf(account);
      const currentTknBalanceWei =
        await ContractsApi.BancorNetworkInfo.read.poolTokenToUnderlying(
          poolDltId,
          currentPoolTokenBalanceWei
        );
      const currentTknBalance = shrinkToken(
        currentTknBalanceWei.toString(),
        decimals
      );
      const currentTknBalanceWithTolerance = new BigNumber(
        currentTknBalance
      ).times(0.99);
      const isWithdrawingMax = new BigNumber(amount.tkn).gt(
        currentTknBalanceWithTolerance
      );
      if (isWithdrawingMax) {
        setPoolTokenAmountWei(currentPoolTokenBalanceWei.toString());
        return;
      }
      const tokenAmountWei = expandToken(amount.tkn, decimals);
      const inputAmountInPoolTokenWei =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          poolDltId,
          tokenAmountWei
        );
      setPoolTokenAmountWei(inputAmountInPoolTokenWei.toString());
    } catch (e) {
      console.error('failed to getWithdrawalAmount', e);
      throw e;
    }
  }, [account, amount.tkn, decimals, poolDltId, poolTokenDltId]);

  const initWithdraw = async () => {
    if (!account) {
      console.error('No account, please connect wallet');
      return;
    }
    try {
      const tx = await ContractsApi.BancorNetwork.write.initWithdrawal(
        poolTokenDltId,
        poolTokenAmountWei
      );
      await tx.wait();
      initWithdrawNotification(
        dispatch,
        tx.hash,
        amount.tkn,
        reserveToken.symbol
      );
      setStep(4);
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      setTxBusy(false);
      console.error('initWithdraw failed', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    }
  };

  const [onStart, ModalApprove] = useApproveModal(
    approveTokens,
    initWithdraw,
    ContractsApi.BancorNetwork.contractAddress
  );

  const handleButtonClick = useCallback(async () => {
    setTxBusy(true);
    await setWithdrawalAmountWei();
  }, [setWithdrawalAmountWei]);

  useEffect(() => {
    if (poolTokenAmountWei === '0' || hasStarted.current) {
      return;
    }
    hasStarted.current = true;
    onStart();
  }, [onStart, poolTokenAmountWei]);

  return {
    token: reserveToken,
    handleButtonClick,
    ModalApprove,
    txBusy,
  };
};

import { useCallback, useMemo, useRef, useState } from 'react';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { expandToken, shrinkToken } from 'utils/formulas';
import {
  initWithdrawNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'redux/index';
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
  const { token, poolTokenId } = holding;

  const poolTokenAmountWei = useRef('0');

  const approveTokens = useMemo(() => {
    const tokensToApprove = [
      {
        // TODO - use bnTKN for approval based on input amount
        amount: poolTokenAmountWei.current,
        token: {
          ...token,
          address: poolTokenId,
          symbol: `bn${token.symbol}`,
        },
      },
    ];
    if (token.address === bntToken) {
      tokensToApprove.push({
        amount: poolTokenAmountWei.current,
        token: {
          ...token,
          address: getNetworkVariables().govToken,
          symbol: `vBNT`,
        },
      });
    }

    return tokensToApprove;
  }, [poolTokenId, token]);

  const setWithdrawalAmountWei = useCallback(async (): Promise<void> => {
    try {
      const currentPoolTokenBalanceWei = await ContractsApi.Token(
        holding.poolTokenId
      ).read.balanceOf(account);
      const currentTknBalanceWei =
        await ContractsApi.BancorNetworkInfo.read.poolTokenToUnderlying(
          holding.poolId,
          currentPoolTokenBalanceWei
        );
      const currentTknBalance = shrinkToken(
        currentTknBalanceWei.toString(),
        token.decimals
      );
      const currentTknBalanceWithTolerance = new BigNumber(
        currentTknBalance
      ).times(0.99);
      const isWithdrawingMax = new BigNumber(amount.tkn).gt(
        currentTknBalanceWithTolerance
      );
      if (isWithdrawingMax) {
        poolTokenAmountWei.current = currentPoolTokenBalanceWei.toString();
        return;
      }
      const tokenAmountWei = expandToken(amount.tkn, holding.token.decimals);
      const inputAmountInPoolTokenWei =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          holding.poolId,
          tokenAmountWei
        );
      poolTokenAmountWei.current = inputAmountInPoolTokenWei.toString();
    } catch (e) {
      console.error('failed to getWithdrawalAmount', e);
      throw e;
    }
  }, [
    account,
    amount.tkn,
    holding.poolId,
    holding.poolTokenId,
    holding.token.decimals,
    token.decimals,
  ]);

  const initWithdraw = async () => {
    try {
      const tx = await ContractsApi.BancorNetwork.write.initWithdrawal(
        holding.poolTokenId,
        poolTokenAmountWei.current
      );
      initWithdrawNotification(
        dispatch,
        tx.hash,
        amount.tkn,
        holding.token.symbol
      );
      await updatePortfolioData(dispatch, account);
      setStep(4);
    } catch (e: any) {
      console.error('initWithdraw failed', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    } finally {
      setTxBusy(false);
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
    onStart();
  }, [onStart, setWithdrawalAmountWei]);

  return { token, handleButtonClick, ModalApprove, approveTokens, txBusy };
};

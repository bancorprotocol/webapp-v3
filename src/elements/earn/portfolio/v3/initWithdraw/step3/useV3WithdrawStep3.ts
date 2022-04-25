import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [hasStarted, setHasStarted] = useState(false);
  const { token, poolTokenId } = holding;

  const [poolTokenAmountWei, setPoolTokenAmountWei] = useState('0');

  const approveTokens = useMemo(() => {
    const tokensToApprove = [
      {
        amount: poolTokenAmountWei,
        token: {
          ...token,
          address: poolTokenId,
          symbol: `bn${token.symbol}`,
        },
      },
    ];
    if (token.address === bntToken) {
      tokensToApprove.push({
        amount: poolTokenAmountWei,
        token: {
          ...token,
          address: getNetworkVariables().govToken,
          symbol: `vBNT`,
        },
      });
    }

    return tokensToApprove;
  }, [poolTokenAmountWei, poolTokenId, token]);

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
        setPoolTokenAmountWei(currentPoolTokenBalanceWei.toString());
        return;
      }
      const tokenAmountWei = expandToken(amount.tkn, holding.token.decimals);
      const inputAmountInPoolTokenWei =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          holding.poolId,
          tokenAmountWei
        );
      setPoolTokenAmountWei(inputAmountInPoolTokenWei.toString());
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
        poolTokenAmountWei
      );
      await tx.wait();
      initWithdrawNotification(
        dispatch,
        tx.hash,
        amount.tkn,
        holding.token.symbol
      );
      setStep(4);
      await updatePortfolioData(dispatch, account);
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
    if (poolTokenAmountWei === '0' || hasStarted) {
      return;
    }
    setHasStarted(true);
    onStart();
  }, [onStart, poolTokenAmountWei, hasStarted]);

  return { token, handleButtonClick, ModalApprove, approveTokens, txBusy };
};

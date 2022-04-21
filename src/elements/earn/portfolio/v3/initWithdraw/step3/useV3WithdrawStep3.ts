import { useMemo, useState } from 'react';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { expandToken } from 'utils/formulas';
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

  const approveTokens = useMemo(() => {
    const tokensToApprove = [
      {
        // TODO - use bnTKN for approval based on input amount
        amount: holding.poolTokenBalance,
        token: {
          ...token,
          address: poolTokenId,
          symbol: `bn${token.symbol}`,
        },
      },
    ];
    if (token.address === bntToken) {
      tokensToApprove.push({
        amount: holding.poolTokenBalance,
        token: {
          ...token,
          address: getNetworkVariables().govToken,
          symbol: `vBNT`,
        },
      });
    }

    return tokensToApprove;
  }, [holding.poolTokenBalance, poolTokenId, token]);

  const initWithdraw = async () => {
    setTxBusy(true);
    const maxBalanceWithTolerance = new BigNumber(amount.tkn).times(0.99);
    const isWithdrawingMax = new BigNumber(holding.tokenBalance).gt(
      maxBalanceWithTolerance
    );
    const tokenAmount = expandToken(amount.tkn, holding.token.decimals);
    try {
      const inputAmountInPoolToken =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          holding.poolId,
          tokenAmount
        );
      const tx = await ContractsApi.BancorNetwork.write.initWithdrawal(
        holding.poolTokenId,
        isWithdrawingMax
          ? expandToken(holding.poolTokenBalance, 18)
          : inputAmountInPoolToken
      );
      initWithdrawNotification(
        dispatch,
        tx.hash,
        amount.tkn,
        holding.token.symbol
      );
      setStep(4);
      await updatePortfolioData(dispatch, account);
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

  return { token, onStart, ModalApprove, approveTokens, txBusy };
};

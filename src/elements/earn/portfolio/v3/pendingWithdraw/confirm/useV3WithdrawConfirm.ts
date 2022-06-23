import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { getTokenById } from 'store/bancor/bancor';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import BigNumber from 'bignumber.js';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { wait } from 'utils/pureFunctions';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import {
  confirmWithdrawNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { useDispatch } from 'react-redux';
import {
  sendWithdrawEvent,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  openCancelModal: (req: WithdrawalRequest) => void;
}
export const useV3WithdrawConfirm = ({
  isModalOpen,
  setIsModalOpen,
  withdrawRequest,
  openCancelModal,
}: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const [outputBreakdown, setOutputBreakdown] = useState({
    tkn: 0,
    bnt: 0,
    totalAmount: '0',
    baseTokenAmount: '0',
    bntAmount: '0',
  });
  const [txBusy, setTxBusy] = useState(false);
  const { pool, poolTokenAmount } = withdrawRequest;
  const token = pool.reserveToken;
  const govToken = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, getNetworkVariables().govToken)
  );
  const isBntToken = useMemo(() => token.address === bntToken, [token]);

  const missingGovTokenBalance = useMemo(() => {
    if (!isBntToken) {
      return 0;
    }
    return new BigNumber(poolTokenAmount)
      .minus(govToken?.balance || 0)
      .toNumber();
  }, [govToken?.balance, isBntToken, poolTokenAmount]);

  useAsyncEffect(async () => {
    if (!isModalOpen) {
      return;
    }

    const res = await fetchWithdrawalRequestOutputBreakdown(withdrawRequest);
    setOutputBreakdown(res);
  }, [withdrawRequest, isModalOpen]);

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
    setOutputBreakdown({
      tkn: 0,
      bnt: 0,
      totalAmount: '0',
      baseTokenAmount: '0',
      bntAmount: '0',
    });
  }, [setIsModalOpen]);

  const withdraw = useCallback(async () => {
    if (!withdrawRequest || !account) {
      return;
    }

    try {
      sendWithdrawEvent(WithdrawEvent.WithdrawCooldownRequest);
      const tx = await ContractsApi.BancorNetwork.write.withdraw(
        withdrawRequest.id
      );
      sendWithdrawEvent(WithdrawEvent.WithdrawCooldownConfirm);
      confirmWithdrawNotification(
        dispatch,
        tx.hash,
        withdrawRequest.reserveTokenAmount,
        token.symbol
      );
      onModalClose();
      setTxBusy(false);
      sendWithdrawEvent(WithdrawEvent.WithdrawSuccess);
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      sendWithdrawEvent(WithdrawEvent.WithdrawFailed, undefined, e.message);
      console.error('withdraw request failed', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      } else {
        genericFailedNotification(dispatch, 'Confirm withdrawal failed');
      }
      onModalClose();
      setTxBusy(false);
    }
  }, [account, dispatch, onModalClose, token.symbol, withdrawRequest]);

  const approveTokens = useMemo(() => {
    const tokensToApprove = [];
    if (token.address === bntToken) {
      tokensToApprove.push({
        amount: poolTokenAmount,
        token: {
          ...token,
          address: govToken?.address ?? '',
          symbol: govToken?.symbol ?? 'vBNT',
        },
      });
    }

    return tokensToApprove;
  }, [govToken?.address, govToken?.symbol, poolTokenAmount, token]);

  const [onStart, ModalApprove] = useApproveModal(
    approveTokens,
    withdraw,
    ContractsApi.BancorNetwork.contractAddress
  );

  const handleWithdrawClick = useCallback(async () => {
    setTxBusy(true);
    onStart();
  }, [onStart]);

  const handleCancelClick = useCallback(async () => {
    onModalClose();
    await wait(400);
    openCancelModal(withdrawRequest);
  }, [onModalClose, openCancelModal, withdrawRequest]);

  return {
    onModalClose,
    ModalApprove,
    token,
    outputBreakdown,
    missingGovTokenBalance,
    txBusy,
    isBntToken,
    handleCancelClick,
    govToken,
    handleWithdrawClick,
  };
};

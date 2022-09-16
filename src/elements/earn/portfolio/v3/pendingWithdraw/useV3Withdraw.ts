import { useAppSelector } from 'store';
import {
  getIsLoadingWithdrawalRequests,
  getPortfolioWithdrawalRequests,
} from 'store/portfolio/v3Portfolio';
import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  genericFailedNotification,
  rejectNotification,
  withdrawCancelNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import {
  sendWithdrawACEvent,
  sendWithdrawEvent,
  WithdrawACEvent,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';
import { popModal, pushModal } from 'store/modals/modals';
import { ModalNames } from 'modals';

export const useV3Withdraw = () => {
  const withdrawalRequests = useAppSelector(getPortfolioWithdrawalRequests);
  const isLoadingWithdrawalRequests = useAppSelector(
    getIsLoadingWithdrawalRequests
  );
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);

  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);

  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);

  const cancelWithdrawal = useCallback(async () => {
    if (!selected || !account) {
      return;
    }

    try {
      sendWithdrawEvent(WithdrawEvent.WithdrawCancelWalletRequest);
      const tx = await ContractsApi.BancorNetwork.write.cancelWithdrawal(
        selected.id
      );
      sendWithdrawEvent(WithdrawEvent.WithdrawCancelWalletConfirm);
      withdrawCancelNotification(
        dispatch,
        tx.hash,
        selected.reserveTokenAmount,
        selected.pool.reserveToken.symbol
      );
      dispatch(popModal(ModalNames.V3WithdrawCancel));
      await tx.wait();
      sendWithdrawEvent(
        WithdrawEvent.WithdrawCancelSuccess,
        undefined,
        undefined,
        undefined,
        tx.hash
      );
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      sendWithdrawEvent(
        WithdrawEvent.WithdrawCancelFailed,
        undefined,
        e.message
      );
      dispatch(popModal(ModalNames.V3WithdrawCancel));
      console.error('cancelWithdrawal failed: ', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      } else {
        genericFailedNotification(dispatch, 'Cancel withdrawal failed');
      }
    }
  }, [account, dispatch, selected]);

  const openCancelModal = useCallback(
    async (req: WithdrawalRequest) => {
      sendWithdrawEvent(WithdrawEvent.WithdrawCancelClick);
      setSelected(req);
      dispatch(
        pushModal({
          modal: ModalNames.V3WithdrawCancel,
          data: { cancelWithdrawal, withdrawRequest: selected },
        })
      );
    },
    [cancelWithdrawal, dispatch, selected]
  );

  const openConfirmModal = useCallback(async (req: WithdrawalRequest) => {
    sendWithdrawACEvent(WithdrawACEvent.CTAClick);
    setSelected(req);
    setIsModalConfirmOpen(true);
  }, []);

  return {
    withdrawalRequests,
    cancelWithdrawal,
    openCancelModal,
    isLoadingWithdrawalRequests,
    selected,
    isModalConfirmOpen,
    setIsModalConfirmOpen,
    openConfirmModal,
  };
};

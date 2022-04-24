import { useAppSelector } from 'redux/index';
import {
  getIsLoadingWithdrawalRequests,
  getPortfolioWithdrawalRequests,
} from 'redux/portfolio/v3Portfolio';
import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  rejectNotification,
  withdrawCancelNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';

export const useV3Withdraw = () => {
  const withdrawalRequests = useAppSelector(getPortfolioWithdrawalRequests);
  const isLoadingWithdrawalRequests = useAppSelector(
    getIsLoadingWithdrawalRequests
  );
  const dispatch = useDispatch();
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );

  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);

  const openCancelModal = useCallback(async (req: WithdrawalRequest) => {
    setSelected(req);
    setIsModalCancelOpen(true);
  }, []);

  const cancelWithdrawal = useCallback(async () => {
    if (!selected || !account) {
      return;
    }

    try {
      const tx = await ContractsApi.BancorNetwork.write.cancelWithdrawal(
        selected.id
      );
      withdrawCancelNotification(
        dispatch,
        tx.hash,
        selected.reserveTokenAmount,
        selected.token.symbol
      );
      setIsModalCancelOpen(false);
      await updatePortfolioData(dispatch, account);
    } catch (e: any) {
      setIsModalCancelOpen(false);
      console.error('cancelWithdrawal failed: ', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    }
  }, [account, dispatch, selected]);

  const openConfirmModal = useCallback(async (req: WithdrawalRequest) => {
    setSelected(req);
    setIsModalConfirmOpen(true);
  }, []);

  return {
    withdrawalRequests,
    cancelWithdrawal,
    openCancelModal,
    isLoadingWithdrawalRequests,
    isModalCancelOpen,
    setIsModalCancelOpen,
    selected,
    isModalConfirmOpen,
    setIsModalConfirmOpen,
    openConfirmModal,
  };
};

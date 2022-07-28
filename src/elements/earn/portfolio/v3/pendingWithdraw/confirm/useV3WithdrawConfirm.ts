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
import { expandToken } from 'utils/formulas';
import {
  sendWithdrawACEvent,
  setCurrentWithdraw,
  WithdrawACEvent,
} from 'services/api/googleTagManager/withdraw';
import {
  getBlockchain,
  getBlockchainNetwork,
  getCurrency,
} from 'services/api/googleTagManager';

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
  const [loadingAmounts, setLoadingAmounts] = useState(false);
  const [withdrawAmounts, setWithdrawAmounts] = useState<{
    tkn: number;
    bnt: number;
    totalAmount: string;
    baseTokenAmount: string;
    bntAmount: string;
  }>();
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
    setLoadingAmounts(true);
    const res = await fetchWithdrawalRequestOutputBreakdown(
      withdrawRequest.reserveToken,
      expandToken(
        withdrawRequest.poolTokenAmount,
        withdrawRequest.pool.reserveToken.decimals
      ),
      expandToken(
        withdrawRequest.reserveTokenAmount,
        withdrawRequest.pool.reserveToken.decimals
      )
    );
    setWithdrawAmounts(res);
    setLoadingAmounts(false);
  }, [withdrawRequest, isModalOpen]);

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
    setWithdrawAmounts(undefined);
  }, [setIsModalOpen]);

  const withdraw = useCallback(
    async (approvalHash?: string) => {
      if (!withdrawRequest || !account) {
        return;
      }
      if (approvalHash)
        sendWithdrawACEvent(
          WithdrawACEvent.WalletUnlimitedConfirm,
          undefined,
          undefined,
          approvalHash
        );

      try {
        sendWithdrawACEvent(WithdrawACEvent.WalletRequest);
        const tx = await ContractsApi.BancorNetwork.write.withdraw(
          withdrawRequest.id
        );
        sendWithdrawACEvent(WithdrawACEvent.WalletConfirm);
        confirmWithdrawNotification(
          dispatch,
          tx.hash,
          withdrawRequest.reserveTokenAmount,
          token.symbol
        );
        onModalClose();
        setTxBusy(false);

        await tx.wait();
        await updatePortfolioData(dispatch);
        sendWithdrawACEvent(
          WithdrawACEvent.Success,
          undefined,
          undefined,
          tx.hash
        );
      } catch (e: any) {
        console.error('withdraw request failed', e);
        sendWithdrawACEvent(WithdrawACEvent.Failed, undefined, e.message);
        if (e.code === ErrorCode.DeniedTx) {
          rejectNotification(dispatch);
        } else {
          genericFailedNotification(dispatch, 'Confirm withdrawal failed');
        }
        onModalClose();
        setTxBusy(false);
      }
    },
    [account, dispatch, onModalClose, token.symbol, withdrawRequest]
  );

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
    (approvalHash?: string) => withdraw(approvalHash),
    ContractsApi.BancorNetwork.contractAddress,
    () => sendWithdrawACEvent(WithdrawACEvent.UnlimitedView),

    (isUnlimited: boolean) => {
      sendWithdrawACEvent(WithdrawACEvent.UnlimitedContinue, isUnlimited);
      sendWithdrawACEvent(WithdrawACEvent.WalletUnlimitedRequest);
    }
  );

  const handleWithdrawClick = useCallback(async () => {
    setCurrentWithdraw({
      withdraw_pool: pool.name,
      withdraw_blockchain: getBlockchain(),
      withdraw_blockchain_network: getBlockchainNetwork(),
      withdraw_token: pool.name,
      withdraw_token_amount: withdrawRequest.reserveTokenAmount,
      withdraw_token_amount_usd: new BigNumber(
        withdrawRequest.reserveTokenAmount
      )
        .times(withdrawRequest.pool.reserveToken.usdPrice)
        .toString(),
      withdraw_display_currency: getCurrency(),
    });
    sendWithdrawACEvent(WithdrawACEvent.ApproveClick);
    setTxBusy(true);
    onStart();
  }, [
    onStart,
    pool.name,
    withdrawRequest.pool.reserveToken.usdPrice,
    withdrawRequest.reserveTokenAmount,
  ]);

  const handleCancelClick = useCallback(async () => {
    onModalClose();
    await wait(400);
    openCancelModal(withdrawRequest);
  }, [onModalClose, openCancelModal, withdrawRequest]);

  return {
    onModalClose,
    ModalApprove,
    token,
    withdrawAmounts,
    missingGovTokenBalance,
    txBusy,
    isBntToken,
    handleCancelClick,
    govToken,
    handleWithdrawClick,
    loadingAmounts,
  };
};

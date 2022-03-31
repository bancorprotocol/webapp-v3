import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { getTokenById } from 'redux/bancor/bancor';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import BigNumber from 'bignumber.js';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { wait } from 'utils/pureFunctions';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  withdraw: () => Promise<void>;
  openCancelModal: (req: WithdrawalRequest) => void;
}
export const useV3WithdrawConfirm = ({
  isModalOpen,
  setIsModalOpen,
  withdrawRequest,
  withdraw,
  openCancelModal,
}: Props) => {
  const [outputBreakdown, setOutputBreakdown] = useState({
    tkn: 0,
    bnt: 0,
  });
  const [txBusy, setTxBusy] = useState(false);
  const { token, poolTokenAmount } = withdrawRequest;
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
    setOutputBreakdown({ tkn: 0, bnt: 0 });
  }, [setIsModalOpen]);

  const handleCTAClick = useCallback(async () => {
    setTxBusy(true);
    try {
      await withdraw();
    } catch (e) {
      console.error(e);
    } finally {
      onModalClose();
      setTxBusy(false);
    }
  }, [onModalClose, withdraw]);

  const handleCancelClick = useCallback(async () => {
    onModalClose();
    await wait(400);
    openCancelModal(withdrawRequest);
  }, [onModalClose, openCancelModal, withdrawRequest]);

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
    handleCTAClick,
    ContractsApi.BancorNetwork.contractAddress
  );

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
    onStart,
  };
};

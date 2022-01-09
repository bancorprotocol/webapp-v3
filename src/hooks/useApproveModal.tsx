import { Token } from 'services/observables/tokens';
import { useCallback, useRef, useState } from 'react';
import {
  ApprovalContract,
  getNetworkContractApproval,
  setNetworkContractApproval,
} from 'services/web3/approval';
import { ModalApproveNew } from 'elements/modalApprove/modalApproveNew';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { useDispatch } from 'react-redux';
import { ErrorCode } from 'services/web3/types';
import { wait } from 'utils/pureFunctions';
import { web3 } from 'services/web3';

interface Tokens {
  token: Token;
  amount: string;
}

export const useApproveModal = (
  tokens: Tokens[],
  onComplete: Function,
  contract: ApprovalContract | string = ApprovalContract.BancorNetwork
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<string[]>([]);

  const awaitConfirmation = useCallback(async () => {
    const receipts = [];
    for (const txHash of ref.current) {
      try {
        const receipt = await web3.provider.getTransactionReceipt(txHash);
        receipts.push(receipt);
      } catch (e: any) {
        console.error('failed to getTransactionReceipt for approve token tx');
        return;
      }
    }

    const successCount = receipts.filter((r) => r && r.status).length;
    if (successCount === ref.current.length) {
      ref.current = [];
      onComplete();
    } else {
      await wait(3000);
      await awaitConfirmation();
    }
  }, [onComplete]);

  const dispatch = useDispatch();

  const checkNextToken = async (index = tokenIndex): Promise<any> => {
    const nextIndex = index + 1;
    const count = tokens.length;
    if (count === nextIndex) {
      return awaitConfirmation();
    }
    await wait(500);
    setTokenIndex(nextIndex);
    return checkApprovalRequired(nextIndex);
  };

  const checkApprovalRequired = async (tokenIndex: number = 0) => {
    const { token, amount } = tokens[tokenIndex];
    const isApprovalRequired = await getNetworkContractApproval(
      token,
      contract,
      amount
    );

    if (!isApprovalRequired) {
      return checkNextToken(tokenIndex);
    }

    setIsOpen(true);
  };

  const setApproval = async (amount?: string) => {
    const { token } = tokens[tokenIndex];
    try {
      setIsLoading(true);
      const txHash = await setNetworkContractApproval(
        token,
        contract,
        amount,
        true
      );

      ref.current = [...ref.current, txHash];
      dispatch(
        addNotification({
          type: NotificationType.pending,
          title: 'Pending Confirmation',
          msg: `Approve ${tokens[tokenIndex].token.symbol} is pending confirmation`,
          updatedInfo: {
            successTitle: 'Transaction Confirmed',
            successMsg: `${amount || 'Unlimited'} approval set for ${
              tokens[tokenIndex].token.symbol
            }`,
            errorTitle: 'Transaction Failed',
            errorMsg: `${tokens[tokenIndex].token.symbol} approval had failed. Please try again or contact support.`,
          },
          txHash,
        })
      );
      setIsOpen(false);
      setIsLoading(false);

      await checkNextToken();
    } catch (e: any) {
      if (e.code === ErrorCode.DeniedTx) {
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Rejected',
            msg: 'You rejected the transaction. If this was by mistake, please try again.',
          })
        );
      } else {
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Failed',
            msg: `${tokens[tokenIndex].token.symbol} approval had failed. Please try again or contact support.`,
          })
        );
      }

      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const onStart = async () => {
    if (tokens.length === 0) {
      console.error('No tokens provided for approval!');
      return;
    }
    await checkApprovalRequired();
  };

  const ModalApprove = ModalApproveNew({
    isOpen,
    setIsOpen,
    amount: tokens[tokenIndex].amount,
    setApproval,
    token: tokens[tokenIndex].token,
    isLoading,
  });

  return [onStart, ModalApprove] as [Function, JSX.Element];
};

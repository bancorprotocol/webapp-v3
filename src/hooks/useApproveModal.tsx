import { Token } from 'services/observables/tokens';
import { useState } from 'react';
import {
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

interface Tokens {
  token: Token;
  amount: string;
}

export const useApproveModal = (
  tokens: Tokens[],
  onComplete: Function,
  contract?: string,
  resolveImmediately?: boolean
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const checkNextToken = async () => {
    const nextIndex = tokenIndex + 1;
    const count = tokens.length;
    if (count === nextIndex) {
      return onComplete();
    }

    setTokenIndex(nextIndex);
    await checkApprovalRequired(nextIndex);
  };

  const checkApprovalRequired = async (tokenIndex: number = 0) => {
    const { token, amount } = tokens[tokenIndex];
    const isApprovalRequired = await getNetworkContractApproval(
      token,
      amount,
      contract
    );

    if (!isApprovalRequired) {
      return checkNextToken();
    }

    setIsOpen(true);
  };

  const setApproval = async (amount?: string) => {
    const { token } = tokens[tokenIndex];
    try {
      setIsLoading(true);
      const txHash = await setNetworkContractApproval(token, amount, contract);
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
    } catch (e) {
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

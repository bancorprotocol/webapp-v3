import { Token } from 'services/observables/tokens';
import { useState } from 'react';
import {
  getNetworkContractApproval,
  setNetworkContractApproval,
} from 'services/web3/approval';
import { ModalApproveNew } from '../elements/modalApprove/modalApproveNew';

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
      const txHash = await setNetworkContractApproval(
        token,
        amount,
        contract,
        resolveImmediately
      );
      console.log('approve success', txHash);
      setIsOpen(false);
      setIsLoading(false);
      await checkNextToken();
    } catch (e) {
      console.error(e.message);
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

import { Modal } from 'components/modal/Modal';
import { ReactComponent as IconLock } from 'assets/icons/lock.svg';
import { Token } from 'services/observables/tokens';
import { useState } from 'react';
import {
  getNetworkContractApproval,
  setNetworkContractApproval,
} from 'services/web3/approval';

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
    const count = tokens.length;
    if (count === tokenIndex + 1) {
      return onComplete();
    }

    const nextIndex = tokenIndex + 1;
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

  const ModalApprove = (
    <Modal title={'Swap'} setIsOpen={setIsOpen} isOpen={isOpen}>
      <div className="p-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
            <IconLock className="w-[22px] text-white" />
          </div>
          <h2 className="text-20 mb-8">
            Approve {tokens[tokenIndex].token.symbol}
          </h2>
          <p className="text-center text-grey-5">
            Before you can proceed, you need to approve{' '}
            {tokens[tokenIndex].token.symbol} spending.
          </p>
          <button
            onClick={() => setApproval()}
            className={'btn-primary w-full my-15'}
            disabled={isLoading}
          >
            Approve
          </button>
          <p className="text-center text-grey-5">
            Want to approve before each transaction?
          </p>
          <button
            onClick={() => setApproval(tokens[tokenIndex].amount)}
            className="underline"
            disabled={isLoading}
          >
            Approve limited permission
          </button>
        </div>
      </div>
    </Modal>
  );

  return [onStart, ModalApprove] as [Function, JSX.Element];
};

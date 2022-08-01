import { useCallback, useRef, useState } from 'react';
import {
  ApprovalContract,
  getApproval,
  setApproval as setUserApproval,
  getApprovalAddress,
} from 'services/web3/approval';
import { ModalApproveNew } from 'elements/modalApprove/modalApproveNew';
import {
  addNotification,
  NotificationType,
} from 'store/notification/notification';
import { useDispatch } from 'react-redux';
import { ErrorCode } from 'services/web3/types';
import { wait } from 'utils/pureFunctions';
import { web3 } from 'services/web3';
import { Events } from 'services/api/googleTagManager';
import { useAppSelector } from 'store/index';
import { expandToken } from 'utils/formulas';

interface Tokens {
  token: {
    address: string;
    symbol: string;
    decimals: number;
  };
  amount: string;
}

export const useApproveModal = (
  tokens: Tokens[] = [],
  onComplete: (txHash?: string) => void,
  contract: ApprovalContract | string = ApprovalContract.BancorNetwork,
  gtmPopupEvent?: (event: Events) => void,
  gtmSelectEvent?: (isUnlimited: boolean) => void,
  onClose?: Function
) => {
  const account = useAppSelector((state) => state.user.account);
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
      onComplete(ref.current.length > 0 ? ref.current[0] : undefined);
      ref.current = [];
    } else {
      await wait(3000);
      await awaitConfirmation();
    }
  }, [onComplete]);

  const dispatch = useDispatch();

  const onStart = async () => {
    if (tokens.length === 0) {
      onComplete();
      return;
    }
    await checkApprovalRequired();
  };

  if (tokens.length === 0) return [onStart, <></>] as [Function, JSX.Element];

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
    if (!account) {
      return;
    }

    const { token, amount } = tokens[tokenIndex];
    const amountWei = expandToken(amount, token.decimals);
    const { isApprovalRequired } = await getApproval(
      token.address,
      account,
      await getApprovalAddress(contract),
      amountWei
    );

    if (!isApprovalRequired) {
      return checkNextToken(tokenIndex);
    }

    gtmPopupEvent && gtmPopupEvent(Events.approvePop);

    setIsOpen(true);
  };

  const setApproval = async (amount?: string) => {
    if (!account) {
      return;
    }
    if (gtmSelectEvent) {
      const isUnlimited = amount === undefined;
      gtmSelectEvent(isUnlimited);
    }
    const { token } = tokens[tokenIndex];
    const amountWei = amount ? expandToken(amount, token.decimals) : undefined;

    try {
      setIsLoading(true);
      const txHash = await setUserApproval(
        token.address,
        account,
        await getApprovalAddress(contract),
        amountWei
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

  const ModalApprove = ModalApproveNew({
    isOpen,
    setIsOpen,
    amount: tokens[tokenIndex].amount,
    setApproval,
    token: tokens[tokenIndex].token,
    isLoading,
    onClose,
  });

  return [onStart, ModalApprove] as [Function, JSX.Element];
};

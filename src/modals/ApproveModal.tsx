import { TokenMinimal } from 'services/observables/tokens';
import { Button, ButtonSize } from 'components/button/Button';
import { Image } from 'components/image/Image';
import { Modal, ModalNames } from 'modals';
import { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { web3 } from 'services/web3';
import {
  getNetworkContractApproval,
  setNetworkContractApproval,
} from 'services/web3/approval';
import { ErrorCode } from 'services/web3/types';
import {
  addNotification,
  NotificationType,
} from 'store/notification/notification';
import { Events } from 'storybook-addon-designs/esm/addon';
import { wait } from 'utils/pureFunctions';
import { useModal } from 'hooks/useModal';
import { useAppSelector } from 'store';
import { getIsModalOpen, getModalData } from 'store/modals/modals';

interface TokenAmount {
  token: TokenMinimal;
  amount: string;
}
interface ApproveModalProps {
  token_amounts: TokenAmount[];
}

export const ApproveModal = () => {
  const dispatch = useDispatch();
  const [tokenIndex, setTokenIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.ApproveModal)
  );
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

  const props = useAppSelector<ApproveModalProps | undefined>((state) =>
    getModalData(state, ModalNames.V3WithdrawConfirm)
  );

  const { token_amounts } = props;

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
    const { token, amount } = tokens[tokenIndex];
    const isApprovalRequired = await getNetworkContractApproval(
      token,
      contract,
      amount
    );

    if (!isApprovalRequired) {
      return checkNextToken(tokenIndex);
    }

    gtmPopupEvent && gtmPopupEvent(Events.approvePop);

    setIsOpen(true);
  };

  const setApproval = async (amount?: string) => {
    if (gtmSelectEvent) {
      const isUnlimited = amount === undefined;
      gtmSelectEvent(isUnlimited);
    }
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

  return (
    <Modal
      onClose={() => {
        if (onClose) onClose();
        setIsOpen(false);
      }}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
    >
      <div className="px-30 py-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center mb-14">
            <Image
              alt={'Token Logo'}
              src={token.logoURI}
              className={'w-[52px] h-[52px] rounded-full'}
            />
          </div>
          <h2 className="text-20 mb-8">Approve {token.symbol}</h2>
          <p className="text-center text-graphite">
            Before you can proceed, you need to approve {token.symbol} spending.
          </p>
          <Button
            onClick={() => setApproval()}
            size={ButtonSize.Full}
            className="my-15"
            disabled={isLoading}
          >
            {isLoading ? 'waiting for confirmation' : 'Approve'}
          </Button>
          <p className="text-center text-graphite">
            Want to approve before each transaction?
          </p>
          <button
            onClick={() => setApproval(amount)}
            className="underline"
            disabled={isLoading}
          >
            Approve limited permission
          </button>
        </div>
      </div>
    </Modal>
  );
};

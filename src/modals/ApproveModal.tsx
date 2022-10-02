import { TokenMinimal } from 'services/observables/tokens';
import { Button, ButtonSize } from 'components/button/Button';
import { Image } from 'components/image/Image';
import { Modal, ModalNames } from 'modals';
import { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { web3 } from 'services/web3';
import {
  ApprovalContract,
  getNetworkContractApproval,
  setNetworkContractApproval,
} from 'services/web3/approval';
import { ErrorCode } from 'services/web3/types';
import {
  addNotification,
  NotificationType,
} from 'store/notification/notification';
import { wait } from 'utils/pureFunctions';
import { useModal } from 'hooks/useModal';
import { useAppSelector } from 'store';
import { getIsModalOpen, getModalData } from 'store/modals/modals';
import { Events } from 'services/api/googleTagManager';

interface TokenAmount {
  token: TokenMinimal;
  amount: string;
}

interface ApproveModalProps {
  token_amounts: TokenAmount[];
  contract: ApprovalContract | string;
  onComplete: (txHash?: string) => void;
  gtmPopupEvent?: (event: Events) => void;
  gtmSelectEvent?: (isUnlimited: boolean) => void;
}

export const ApproveModal = () => {
  const dispatch = useDispatch();
  const ref = useRef<string[]>([]);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.ApproveModal)
  );
  const props = useAppSelector<ApproveModalProps | undefined>((state) =>
    getModalData(state, ModalNames.V3WithdrawConfirm)
  );

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
      props?.onComplete(ref.current.length > 0 ? ref.current[0] : undefined);
      ref.current = [];
    } else {
      await wait(3000);
      await awaitConfirmation();
    }
  }, [props?.onComplete]);

  if (!props) return null;

  const { token_amounts, contract, gtmPopupEvent, gtmSelectEvent } = props;
  if (token_amounts.length === 0) return null;

  const checkNextToken = async (index = tokenIndex): Promise<any> => {
    const nextIndex = index + 1;
    const count = token_amounts.length;
    if (count === nextIndex) {
      return awaitConfirmation();
    }
    await wait(500);
    setTokenIndex(nextIndex);
    return checkApprovalRequired(nextIndex);
  };

  const checkApprovalRequired = async (tokenIndex: number = 0) => {
    const { token, amount } = token_amounts[tokenIndex];
    const isApprovalRequired = await getNetworkContractApproval(
      token,
      contract,
      amount
    );

    if (!isApprovalRequired) {
      return checkNextToken(tokenIndex);
    }

    gtmPopupEvent && gtmPopupEvent(Events.approvePop);
  };

  const setApproval = async (amount?: string) => {
    if (gtmSelectEvent) {
      const isUnlimited = amount === undefined;
      gtmSelectEvent(isUnlimited);
    }
    const { token } = token_amounts[tokenIndex];
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
          msg: `Approve ${token_amounts[tokenIndex].token.symbol} is pending confirmation`,
          updatedInfo: {
            successTitle: 'Transaction Confirmed',
            successMsg: `${amount || 'Unlimited'} approval set for ${
              token_amounts[tokenIndex].token.symbol
            }`,
            errorTitle: 'Transaction Failed',
            errorMsg: `${token_amounts[tokenIndex].token.symbol} approval had failed. Please try again or contact support.`,
          },
          txHash,
        })
      );
      popModal();
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
            msg: `${token_amounts[tokenIndex].token.symbol} approval had failed. Please try again or contact support.`,
          })
        );
      }

      popModal();
      setIsLoading(false);
    }
  };

  const token = token_amounts[tokenIndex].token;
  const amount = token_amounts[tokenIndex].amount;

  return (
    <Modal setIsOpen={popModal} isOpen={isOpen}>
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

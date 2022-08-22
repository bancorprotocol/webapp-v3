import { Modal } from 'components/modal/Modal';
import { ReactComponent as IconLock } from 'assets/icons/lock.svg';
import {
  addNotification,
  NotificationType,
} from 'store/notification/notification';
import {
  ApprovalContract,
  setNetworkContractApproval,
} from 'services/web3/approval';
import { useDispatch } from 'react-redux';
import { Token } from 'services/observables/tokens';
import { web3 } from 'services/web3';
import { wait } from 'utils/pureFunctions';
import { ErrorCode } from 'services/web3/types';
import { Button, ButtonSize } from 'components/button/Button';
import { sendConversionEvent } from 'services/api/googleTagManager/conversion';
import { Events } from 'services/api/googleTagManager';

interface ModalApproveProps {
  setIsOpen: Function;
  isOpen: boolean;
  amount: string;
  fromToken?: Token;
  handleApproved: Function;
  waitForApproval?: boolean;
  contract: ApprovalContract;
}

export const ModalApprove = ({
  setIsOpen,
  isOpen,
  amount,
  fromToken,
  handleApproved,
  waitForApproval,
  contract,
}: ModalApproveProps) => {
  const dispatch = useDispatch();

  if (!fromToken) return null;

  // Wait for user to choose approval and proceed with approval based on user selection
  // Prop amount is UNDEFINED when UNLIMITED
  const approve = async (amount?: string) => {
    try {
      setIsOpen(false);
      const isUnlimited = amount === undefined;
      sendConversionEvent(Events.approved, undefined, isUnlimited);
      const txHash = await setNetworkContractApproval(
        fromToken,
        contract,
        amount
      );
      dispatch(
        addNotification({
          type: NotificationType.pending,
          title: 'Pending Confirmation',
          msg: `Approve ${fromToken.symbol} is pending confirmation`,
          updatedInfo: {
            successTitle: 'Transaction Confirmed',
            successMsg: `${amount || 'Unlimited'} approval set for ${
              fromToken.symbol
            }`,
            errorTitle: 'Transaction Failed',
            errorMsg: `${fromToken.symbol} approval had failed. Please try again or contact support.`,
          },
          txHash,
        })
      );
      if (waitForApproval) {
        let tx = null;
        while (tx === null)
          try {
            await wait(2000);
            tx = await web3.provider.getTransactionReceipt(txHash);
          } catch (error) {}
      }
      handleApproved();
    } catch (e: any) {
      setIsOpen(false);
      if (e.code === ErrorCode.DeniedTx)
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Rejected',
            msg: 'You rejected the transaction. If this was by mistake, please try again.',
          })
        );
      else
        addNotification({
          type: NotificationType.error,
          title: 'Transaction Failed',
          msg: `${fromToken.symbol} approval had failed. Please try again or contact support.`,
        });
    }
  };

  return (
    <Modal title={'Set Allowance'} setIsOpen={setIsOpen} isOpen={isOpen}>
      <div className="p-10 px-30">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
            <IconLock className="w-[22px] text-white" />
          </div>
          <h2 className="text-20 mb-8">Approve {fromToken.symbol}</h2>
          <p className="text-center text-graphite">
            Before you can proceed, you need to approve {fromToken.symbol}{' '}
            spending.
          </p>
          <Button
            size={ButtonSize.Full}
            onClick={() => approve()}
            className="my-15"
          >
            Approve
          </Button>
          <p className="text-center text-graphite">
            Want to approve before each transaction?
          </p>
          <button onClick={() => approve(amount)} className="underline">
            Approve limited permission
          </button>
        </div>
      </div>
    </Modal>
  );
};

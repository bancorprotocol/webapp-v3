import { Modal } from 'components/modal/Modal';
import { ReactComponent as IconLock } from 'assets/icons/lock.svg';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { setNetworkContractApproval } from 'services/web3/approval';
import { useDispatch } from 'react-redux';
import { Token } from 'services/observables/tokens';

interface ModalApproveProps {
  setIsOpen: Function;
  isOpen: boolean;
  amount: string;
  fromToken?: Token;
  handleApproved: Function;
  handleCatch: Function;
}

export const ModalApprove = ({
  setIsOpen,
  isOpen,
  amount,
  fromToken,
  handleApproved,
  handleCatch,
}: ModalApproveProps) => {
  const dispatch = useDispatch();

  if (!fromToken) return null;

  // Wait for user to choose approval and proceed with approval based on user selection
  // Prop amount is UNDEFINED when UNLIMITED
  const approve = async (amount?: string) => {
    try {
      await setNetworkContractApproval(fromToken, amount);
      setIsOpen(false);
      dispatch(
        addNotification({
          type: NotificationType.success,
          title: `Approve ${fromToken.symbol}`,
          msg: `${amount || 'Unlimited'} Swap approval set for ${
            fromToken.symbol
          }.`,
        })
      );
      handleApproved();
    } catch (e) {
      console.error('setNetworkContractApproval failed', e);
      setIsOpen(false);
      handleCatch();
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Approve Token',
          msg: 'Unkown error - check console log.',
        })
      );
    }
  };

  return (
    <Modal title={'Swap'} setIsOpen={setIsOpen} isOpen={isOpen}>
      <div className="p-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
            <IconLock className="w-[22px] text-white" />
          </div>
          <h2 className="text-20 font-semibold mb-8">
            Approve {fromToken.symbol}
          </h2>
          <p className="text-center text-grey-5">
            Before you can proceed, you need to approve {fromToken.symbol}{' '}
            spending.
          </p>
          <button
            onClick={() => approve()}
            className={'btn-primary w-full my-15'}
          >
            Approve
          </button>
          <p className="text-center text-grey-5">
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

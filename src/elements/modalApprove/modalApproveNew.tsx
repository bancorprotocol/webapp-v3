import { ReactComponent as IconLock } from '../../assets/icons/lock.svg';
import { Modal } from 'components/modal/Modal';
import { Token } from 'services/observables/tokens';
import { Button } from 'components/button/Button';

interface Props {
  isOpen: boolean;
  setIsOpen: Function;
  setApproval: Function;
  token: Token;
  amount: string;
  isLoading: boolean;
  onClose?: Function;
}

export const ModalApproveNew = ({
  isOpen,
  setIsOpen,
  setApproval,
  token,
  amount,
  isLoading,
  onClose,
}: Props) => {
  return (
    <Modal
      onClose={() => {
        if (onClose) onClose();
        setIsOpen(false);
      }}
      title={'Set Allowance'}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
    >
      <div className="px-30 py-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
            <IconLock className="w-[22px] text-white" />
          </div>
          <h2 className="text-20 mb-8">Approve {token.symbol}</h2>
          <p className="text-center text-graphite">
            Before you can proceed, you need to approve {token.symbol} spending.
          </p>
          <Button
            onClick={() => setApproval()}
            className={'w-full my-15'}
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

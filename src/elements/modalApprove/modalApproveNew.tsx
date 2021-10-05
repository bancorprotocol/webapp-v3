import { ReactComponent as IconLock } from '../../assets/icons/lock.svg';
import { Modal } from 'components/modal/Modal';
import { Token } from 'services/observables/tokens';

interface Props {
  isOpen: boolean;
  setIsOpen: Function;
  setApproval: Function;
  token: Token;
  amount: string;
  isLoading: boolean;
}

export const ModalApproveNew = ({
  isOpen,
  setIsOpen,
  setApproval,
  token,
  amount,
  isLoading,
}: Props) => {
  return (
    <Modal title={'Swap'} setIsOpen={setIsOpen} isOpen={isOpen}>
      <div className="p-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
            <IconLock className="w-[22px] text-white" />
          </div>
          <h2 className="text-20 mb-8">Approve {token.symbol}</h2>
          <p className="text-center text-grey-5">
            Before you can proceed, you need to approve {token.symbol} spending.
          </p>
          <button
            onClick={() => setApproval()}
            className={'btn-primary w-full my-15'}
            disabled={isLoading}
          >
            {isLoading ? 'waiting for confirmation' : 'Approve'}
          </button>
          <p className="text-center text-grey-5">
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

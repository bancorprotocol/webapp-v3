import { Modal } from 'components/modal/Modal';
import { ReactComponent as IconLock } from 'assets/icons/lock.svg';

interface ModalApproveProps {
  setIsOpen: Function;
  isOpen: boolean;
  step: number;
  steps: any;
  amount: string;
  symbol: string;
  approve: Function;
}

export const ModalApprove = ({
  setIsOpen,
  isOpen,
  step,
  steps,
  amount,
  symbol,
  approve,
}: ModalApproveProps) => {
  return (
    <Modal title={'Swap'} setIsOpen={setIsOpen} isOpen={isOpen}>
      <div>
        {step !== 1 && (
          <>
            {'current step' + step}
            <br />
            {steps[step]}
          </>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center text-12 mb-20">
            <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
              <IconLock className="w-[22px] text-white" />
            </div>
            <h2 className="text-20 font-semibold mb-8">Approve {symbol}</h2>
            <p className="text-center text-grey-5">
              Before you can proceed, you need to approve {symbol} spending.
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
        )}
      </div>
    </Modal>
  );
};

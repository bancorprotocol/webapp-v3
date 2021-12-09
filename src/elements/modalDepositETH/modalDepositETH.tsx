import { Modal } from 'components/modal/Modal';
import { ReactComponent as IconDeposit } from 'assets/icons/deposit.svg';

interface ModalDepositETHProps {
  amount: string;
  isOpen: boolean;
  setIsOpen: Function;
  onConfirm: Function;
}
export const ModalDepositETH = ({
  amount,
  isOpen,
  setIsOpen,
  onConfirm,
}: ModalDepositETHProps) => {
  return (
    <Modal
      titleElement={<div className="w-full"></div>}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => setIsOpen(false)}
    >
      <div className="flex flex-col items-center text-center px-40 pb-40">
        <IconDeposit className="w-40 h-40" />
        <div className="text-20 my-20">Confirm WETH deposit</div>

        <div className="text-12 border border-grey-2 dark:border-grey-4 rounded-20 p-15 w-full">
          <div className="text-grey-4 dark:text-grey-3 mb-5">
            You Will Receive
          </div>
          {amount} WETH
        </div>
        <div className="my-15 text-grey-4 dark:text-grey-3">
          WETH is a token that represents ETH 1:1 and conforms to the ERC20
          token standard
        </div>
        <button
          className="btn-primary rounded w-full"
          onClick={() => {
            setIsOpen(false);
            onConfirm();
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

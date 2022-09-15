import { ReactComponent as IconDeposit } from 'assets/icons/deposit.svg';
import { Button, ButtonSize } from 'components/button/Button';
import { Modal, ModalNames } from 'modals';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { getModalOpen, popModal } from 'store/modals/modals';

interface DepositETHProp {
  amount: string;
  onConfirm: Function;
}

export const DepositETHModal = () => {
  const dispatch = useDispatch();
  const isOpen = useAppSelector((state) =>
    getModalOpen(state, ModalNames.DepositETH)
  );

  const props = useAppSelector<DepositETHProp | undefined>((state) =>
    state.modals.openModals.get(ModalNames.DepositETH)
  );

  const onClose = () => {
    dispatch(popModal(ModalNames.DepositETH));
  };

  return (
    <Modal
      titleElement={<div className="w-full"></div>}
      isOpen={isOpen}
      setIsOpen={onClose}
    >
      <div className="flex flex-col items-center text-center px-40 pb-40">
        <IconDeposit className="w-40 h-40" />
        <div className="text-20 my-20">Confirm WETH deposit</div>

        <div className="text-12 border border-silver dark:border-grey rounded-20 p-15 w-full">
          <div className="text-grey dark:text-graphite mb-5">
            You Will Receive
          </div>
          {props?.amount} WETH
        </div>
        <div className="my-15 text-grey dark:text-graphite">
          WETH is a token that represents ETH 1:1 and conforms to the ERC20
          token standard
        </div>
        <Button
          size={ButtonSize.Full}
          onClick={() => {
            onClose();
            props?.onConfirm();
          }}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

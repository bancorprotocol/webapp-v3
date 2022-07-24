import { Modal } from 'modals';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { setDisableDepositOpen } from 'store/modals/modals';

export const DepositDisabledModal = () => {
  const dispatch = useDispatch();
  const isOpen = useAppSelector((state) => state.modals.disableDepositOpen);

  const onClose = () => {
    dispatch(setDisableDepositOpen(false));
  };

  return (
    <>
      <Modal setIsOpen={onClose} isOpen={isOpen} large>
        <div className="flex flex-col items-center gap-20 p-20 pb-40 text-center">
          <div className="text-3xl mb-30">Deposits are temporarily paused.</div>
        </div>
      </Modal>
    </>
  );
};

import { Modal } from 'modals';
import { useState } from 'react';

export const DepositDisabledModal = ({
  renderButton,
}: {
  renderButton: (onClick: () => void) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = async () => {
    setIsOpen(false);
  };

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <Modal setIsOpen={onClose} isOpen={isOpen} large>
        <div className="flex flex-col items-center gap-20 p-20 pb-40 text-center">
          <div className="text-3xl mb-30">Deposits are temporarily paused.</div>
        </div>
      </Modal>
    </>
  );
};

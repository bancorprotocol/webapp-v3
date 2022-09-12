import { useState } from 'react';
import { Navigate } from 'components/navigate/Navigate';
import { Modal } from 'modals';

interface Props {
  renderButton: (onClick: () => void) => React.ReactNode;
}

export const DepositDisabledModal = ({ renderButton }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = async () => {
    setIsOpen(false);
  };

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <Modal setIsOpen={onClose} isOpen={isOpen} large>
        <div className="flex flex-col items-center gap-20 p-20 pb-40 text-center">
          <div className="leading-7 text-20 mb-30">
            Deposits are currently disabled in the bancor.network UI. To deposit
            via Etherscan at your own risk,{' '}
            <Navigate
              to="https://docs.bancor.network/guides/bancor-etherscan-guide/deposit"
              className="text-primary dark:text-primary"
            >
              follow this guide
            </Navigate>
            .
          </div>
        </div>
      </Modal>
    </>
  );
};

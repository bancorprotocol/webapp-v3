import { useState } from 'react';
import { Navigate } from 'components/navigate/Navigate';
import { Modal } from 'modals';

interface Props {
  renderButton: (onClick: () => void) => React.ReactNode;
  isV3: boolean;
}

const V3Content = (
  <div className="leading-7 text-20 mb-30">
    Deposits are currently disabled in the bancor.network UI. To deposit via
    Etherscan at your own risk,{' '}
    <Navigate
      to="https://docs.bancor.network/guides/bancor-etherscan-guide/deposit"
      className="text-primary dark:text-primary"
    >
      follow this guide
    </Navigate>
    .
  </div>
);

const V2Content = (
  <div className="leading-7 text-20 mb-30">
    Deposits are currently disabled on all v2 pools.
  </div>
);

export const DepositDisabledModal = ({ renderButton, isV3 }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = async () => {
    setIsOpen(false);
  };

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <Modal setIsOpen={onClose} isOpen={isOpen} large>
        <div className="flex flex-col items-center gap-20 p-20 pb-40 text-center">
          {isV3 ? V3Content : V2Content}
        </div>
      </Modal>
    </>
  );
};

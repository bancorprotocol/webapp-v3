import { useState } from 'react';
import { ModalV3 } from 'components/modal/ModalV3';

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
      <ModalV3 setIsOpen={onClose} isOpen={isOpen} large>
        <div className="flex flex-col items-center gap-20 p-20 pb-40 text-center">
          <div className="text-3xl mb-30">Deposits are currently disabled in the bancor.network UI. To deposit via Etherscan at your own risk, <a href="https://docs.bancor.network/guides/bancor-etherscan-guide/deposit" target="_blank">follow this guide</a>.</div>
        </div>
      </ModalV3>
    </>
  );
};

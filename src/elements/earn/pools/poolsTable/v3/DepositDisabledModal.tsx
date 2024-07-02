import { useState } from 'react';
import { ModalV3 } from 'components/modal/ModalV3';

interface Props {
  renderButton: (onClick: () => void) => React.ReactNode;
  isV3: boolean;
  symbol: string;
}

const V3Content = ({ symbol }: { symbol: string }) => (
  <div className="leading-7 text-20 mb-30">
    Deposits to the {symbol} pool are currently disabled and are not available.
  </div>
);

const V2Content = () => (
  <div className="leading-7 text-20 mb-30">
    Deposits are currently disabled on all v2 pools.
  </div>
);

export const DepositDisabledModal = ({ renderButton, isV3, symbol }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = async () => {
    setIsOpen(false);
  };

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <ModalV3 setIsOpen={onClose} isOpen={isOpen} large>
        <div className="flex flex-col items-center gap-20 p-20 pb-40 text-center">
          {isV3 ? <V3Content symbol={symbol} /> : <V2Content />}
        </div>
      </ModalV3>
    </>
  );
};

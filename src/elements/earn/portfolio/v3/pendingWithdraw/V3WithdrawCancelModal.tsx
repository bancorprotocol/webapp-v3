import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { memo, useCallback, useState } from 'react';
import { Modal } from 'components/modal/Modal';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button } from 'components/button/Button';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  cancelWithdrawal: () => Promise<void>;
}

export const V3WithdrawCancelModal = memo(
  ({
    isModalOpen,
    setIsModalOpen,
    withdrawRequest,
    cancelWithdrawal,
  }: Props) => {
    const [txBusy, setTxBusy] = useState(false);
    const { token, reserveTokenAmount } = withdrawRequest;

    const handleCTAClick = useCallback(async () => {
      setTxBusy(true);
      await cancelWithdrawal();
      setIsModalOpen(false);
      setTxBusy(false);
    }, [cancelWithdrawal, setIsModalOpen]);

    return (
      <Modal
        title="Cancel withdrawl & earn"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      >
        <div className="p-20 space-y-20">
          <TokenBalance
            symbol={token.symbol}
            amount={reserveTokenAmount}
            usdPrice={token.usdPrice ?? '0'}
            imgUrl={token.logoURI}
          />
          <Button onClick={handleCTAClick} className="w-full" disabled={txBusy}>
            Cancel Withdrawal
          </Button>
        </div>
      </Modal>
    );
  }
);

import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { memo, useCallback, useState } from 'react';
import { wait } from 'utils/pureFunctions';
import { Modal } from 'components/modal/Modal';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonVariant } from 'components/button/Button';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  withdraw: () => Promise<void>;
  openCancelModal: (req: WithdrawalRequest) => void;
}

export const V3WithdrawConfirmModal = memo(
  ({
    isModalOpen,
    setIsModalOpen,
    withdrawRequest,
    withdraw,
    openCancelModal,
  }: Props) => {
    const [txBusy, setTxBusy] = useState(false);
    const { token, reserveTokenAmount } = withdrawRequest;

    const handleCTAClick = useCallback(async () => {
      setTxBusy(true);
      try {
        await withdraw();
      } catch (e) {
        console.error(e);
      } finally {
        setIsModalOpen(false);
        setTxBusy(false);
      }
    }, [setIsModalOpen, withdraw]);

    const handleCancelClick = useCallback(async () => {
      setIsModalOpen(false);
      await wait(400);
      openCancelModal(withdrawRequest);
    }, [openCancelModal, setIsModalOpen, withdrawRequest]);

    return (
      <Modal
        title="Confirm Withdraw"
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
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={handleCancelClick}
            className="w-full"
            disabled={txBusy}
          >
            Cancel
          </Button>
          <Button onClick={handleCTAClick} className="w-full" disabled={txBusy}>
            Confirm Withdrawal
          </Button>
        </div>
      </Modal>
    );
  }
);

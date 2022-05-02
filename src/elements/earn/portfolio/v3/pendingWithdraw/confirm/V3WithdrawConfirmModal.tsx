import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button } from 'components/button/Button';
import { V3WithdrawConfirmOutputBreakdown } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmOutputBreakdown';
import { useV3WithdrawConfirm } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/useV3WithdrawConfirm';
import { V3WithdrawConfirmInfo } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmInfo';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  openCancelModal: (req: WithdrawalRequest) => void;
}

export const V3WithdrawConfirmModal = memo(
  ({
    isModalOpen,
    setIsModalOpen,
    withdrawRequest,
    openCancelModal,
  }: Props) => {
    const {
      onModalClose,
      ModalApprove,
      token,
      outputBreakdown,
      missingGovTokenBalance,
      txBusy,
      isBntToken,
      handleCancelClick,
      govToken,
      handleWithdrawClick,
    } = useV3WithdrawConfirm({
      setIsModalOpen,
      withdrawRequest,
      openCancelModal,
      isModalOpen,
    });

    return (
      <Modal
        title="Withdraw"
        isOpen={isModalOpen}
        setIsOpen={onModalClose}
        large
      >
        <div className="p-20 md:p-30 space-y-20">
          {ModalApprove}

          <TokenBalanceLarge
            symbol={token.symbol}
            amount={withdrawRequest.reserveTokenAmount}
            usdPrice={token.usdPrice}
            logoURI={token.logoURI}
            label={'Amount'}
          />

          <V3WithdrawConfirmOutputBreakdown
            outputBreakdown={outputBreakdown}
            isBntToken={isBntToken}
            symbol={token.symbol}
          />

          <V3WithdrawConfirmInfo
            withdrawRequest={withdrawRequest}
            handleCancelClick={handleCancelClick}
          />

          {missingGovTokenBalance > 0 ? (
            <div className="text-error text-center bg-error bg-opacity-30 rounded p-20">
              <span className="font-semibold">vBNT Balance insufficient.</span>{' '}
              <br />
              To proceed, add {missingGovTokenBalance} {govToken?.symbol} to
              your wallet.
            </div>
          ) : (
            <Button
              onClick={() => handleWithdrawClick()}
              className="w-full"
              disabled={txBusy || missingGovTokenBalance > 0}
            >
              Confirm Withdrawal
            </Button>
          )}
        </div>
      </Modal>
    );
  }
);

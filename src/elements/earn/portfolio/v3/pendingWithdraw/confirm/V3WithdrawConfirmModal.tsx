import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useMemo } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button, ButtonSize } from 'components/button/Button';
import { V3WithdrawConfirmOutputBreakdown } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmOutputBreakdown';
import { useV3WithdrawConfirm } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/useV3WithdrawConfirm';
import { V3WithdrawConfirmInfo } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmInfo';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { useIsPoolStable } from 'hooks/useIsPoolStable';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';

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

    const { isPoolStable, isLoading } = useIsPoolStable(token.address);

    const isWithdrawDisabled = useMemo(
      () =>
        txBusy ||
        missingGovTokenBalance > 0 ||
        (!isPoolStable && withdrawRequest.pool.tradingEnabled),
      [
        isPoolStable,
        missingGovTokenBalance,
        txBusy,
        withdrawRequest.pool.tradingEnabled,
      ]
    );

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

          <V3WithdrawConfirmInfo handleCancelClick={handleCancelClick} />

          {!isPoolStable && !isLoading && withdrawRequest.pool.tradingEnabled && (
            <div className="bg-warning bg-opacity-10 rounded p-20">
              <div className="font-semibold text-warning flex items-center">
                <IconInfo className="w-14 mr-10" />
                Withdrawal is temporarily paused!
              </div>
              <div className="ml-[24px] text-secondary">
                Price in the pool is to volatile, lets wait a few minutes before
                proceeding.
              </div>
            </div>
          )}

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
              size={ButtonSize.Full}
              disabled={isWithdrawDisabled}
            >
              Confirm Withdrawal
            </Button>
          )}
        </div>
      </Modal>
    );
  }
);

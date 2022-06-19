import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button, ButtonSize } from 'components/button/Button';
import { V3WithdrawConfirmOutputBreakdown } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmOutputBreakdown';
import { useV3WithdrawConfirm } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/useV3WithdrawConfirm';
import { V3WithdrawConfirmInfo } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmInfo';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { useIsPoolStable } from 'hooks/useIsPoolStable';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { shrinkToken } from 'utils/formulas';
import { bntDecimals } from 'services/web3/config';

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

    return (
      <Modal
        title="Withdraw"
        isOpen={isModalOpen}
        setIsOpen={onModalClose}
        large
      >
        <div className="p-20 space-y-20 md:p-30">
          {ModalApprove}

          <TokenBalanceLarge
            symbol={token.symbol}
            amount={
              isBntToken
                ? shrinkToken(outputBreakdown.bntAmount, bntDecimals)
                : shrinkToken(outputBreakdown.baseTokenAmount, token.decimals)
            }
            usdPrice={token.usdPrice}
            logoURI={token.logoURI}
            label={'Final amount'}
          />

          <V3WithdrawConfirmOutputBreakdown
            outputBreakdown={outputBreakdown}
            isBntToken={isBntToken}
            symbol={token.symbol}
          />

          <V3WithdrawConfirmInfo handleCancelClick={handleCancelClick} />

          {isPoolStable === false &&
            !isLoading &&
            withdrawRequest.pool.tradingEnabled && (
              <div className="p-20 rounded bg-warning bg-opacity-10">
                <div className="flex items-center font-semibold text-warning">
                  <IconInfo className="mr-10 w-14" />
                  Withdrawal is temporarily paused!
                </div>
                <div className="ml-[24px] text-secondary">
                  Price in the pool is to volatile, lets wait a few minutes
                  before proceeding.
                </div>
              </div>
            )}

          {missingGovTokenBalance > 0 ? (
            <div className="p-20 text-center rounded text-error bg-error bg-opacity-30">
              <span className="font-semibold">vBNT Balance insufficient.</span>{' '}
              <br />
              To proceed, add {missingGovTokenBalance} {govToken?.symbol} to
              your wallet.
            </div>
          ) : (
            <Button
              onClick={() => handleWithdrawClick()}
              size={ButtonSize.Full}
              disabled={
                txBusy ||
                missingGovTokenBalance > 0 ||
                (isPoolStable === false &&
                  withdrawRequest.pool.tradingEnabled) ||
                isLoading
              }
            >
              Confirm Withdrawal
            </Button>
          )}
        </div>
      </Modal>
    );
  }
);

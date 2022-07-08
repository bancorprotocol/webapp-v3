import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useEffect, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useV3WithdrawConfirm } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/useV3WithdrawConfirm';
import { V3WithdrawConfirmInfo } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmInfo';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { useIsPoolStable } from 'hooks/useIsPoolStable';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { shrinkToken } from 'utils/formulas';
import { bntDecimals, bntToken } from 'services/web3/config';
import { Switch } from 'components/switch/Switch';
import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';

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

    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
      setIsConfirmed(false);
    }, [isModalOpen]);

    const { isPoolStable, isLoading } = useIsPoolStable(token.address);

    const isBNT = withdrawRequest.pool.poolDltId === bntToken;

    return (
      <ModalFullscreenV3
        title="Complete Withdraw"
        isOpen={isModalOpen}
        setIsOpen={onModalClose}
      >
        <div className="w-[520px] p-20 space-y-20 md:p-30">
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
            label="Amount"
            showWarning={!isBNT}
          />
          {!isBNT && (
            <div className="flex text-start gap-10 text-error bg-error bg-opacity-10 rounded-20 w-[460px] p-20">
              <Switch
                selected={isConfirmed}
                onChange={() => setIsConfirmed(!isConfirmed)}
              />
              <div>
                <div className="text-error-hover">
                  BNT distribution is currently disabled.
                </div>
                <div>
                  If I withdraw now, I expect to receive the amount shown above.
                  I understand I may be withdrawing at a loss if the ETH vault
                  is in deficit.
                </div>
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
                (!isConfirmed && !isBNT) ||
                txBusy ||
                missingGovTokenBalance > 0 ||
                (isPoolStable === false &&
                  withdrawRequest.pool.tradingEnabled) ||
                isLoading
              }
              variant={ButtonVariant.Secondary}
            >
              Withdraw
            </Button>
          )}

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
                  Price in the pool is too volatile, lets wait a few minutes
                  before proceeding.
                </div>
              </div>
            )}
        </div>
      </ModalFullscreenV3>
    );
  }
);

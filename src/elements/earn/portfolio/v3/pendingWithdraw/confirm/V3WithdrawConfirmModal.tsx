import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useEffect, useMemo, useState } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button, ButtonSize } from 'components/button/Button';
import { useV3WithdrawConfirm } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/useV3WithdrawConfirm';
import { V3WithdrawConfirmInfo } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmInfo';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { useIsPoolStable } from 'hooks/useIsPoolStable';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { EmergencyInfo } from 'components/EmergencyInfo';
import { useAppSelector } from 'store';
import { shrinkToken } from 'utils/formulas';
import { bntDecimals } from 'services/web3/config';
import { Switch } from 'components/switch/Switch';

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

    const { lockDuration } = useAppSelector(
      (state) => state.v3Portfolio.withdrawalSettings
    );

    const lockDurationInDays = useMemo(
      () => lockDuration / 60 / 60 / 24,
      [lockDuration]
    );

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

          <div className="flex flex-col items-center font-bold text-center text-error text-16">
            Withdrawals involve a {lockDurationInDays}-day cool-down. Please
            note that IL protection is temporarily paused.
            <PopoverV3
              children={<EmergencyInfo />}
              hover
              buttonElement={() => (
                <span className="underline cursor-pointer">More info</span>
              )}
            />
          </div>

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

          <div className="flex items-center gap-10 mx-10">
            I understand that the withdrawal amount does not include any
            impermanent loss compensation
            <Switch
              selected={isConfirmed}
              onChange={() => setIsConfirmed(!isConfirmed)}
            />
          </div>

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
                !isConfirmed ||
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

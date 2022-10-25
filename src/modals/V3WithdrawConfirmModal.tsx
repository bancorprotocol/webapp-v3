import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useEffect, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useV3WithdrawConfirm } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/useV3WithdrawConfirm';
import { V3WithdrawConfirmInfo } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmInfo';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { useIsPoolStable } from 'hooks/useIsPoolStable';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { shrinkToken } from 'utils/formulas';
import { bntToken } from 'services/web3/config';
import { Switch } from 'components/switch/Switch';
import { ModalFullscreen, ModalNames } from 'modals';
import { useAppSelector } from 'store';
import { getIsModalOpen, getModalData } from 'store/modals/modals';
import { useModal } from 'hooks/useModal';

interface V3WithdrawConfirmProps {
  withdrawRequest: WithdrawalRequest;
  openCancelModal: (req: WithdrawalRequest) => void;
}

export const V3WithdrawConfirmModal = memo(() => {
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.V3WithdrawConfirm)
  );

  const props = useAppSelector<V3WithdrawConfirmProps | undefined>((state) =>
    getModalData(state, ModalNames.V3WithdrawConfirm)
  );

  if (!props) return null;

  return (
    <ModalFullscreen
      title="Complete Withdraw"
      isOpen={isOpen}
      setIsOpen={popModal}
    >
      <V3WithdrawConfirmContent
        withdrawRequest={props.withdrawRequest}
        openCancelModal={props.openCancelModal}
        isModalOpen={isOpen}
        setIsModalOpen={popModal}
      />
    </ModalFullscreen>
  );
});

export const V3WithdrawConfirmContent = ({
  isModalOpen,
  setIsModalOpen,
  withdrawRequest,
  openCancelModal,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  openCancelModal: (req: WithdrawalRequest) => void;
}) => {
  const {
    token,
    loadingAmounts,
    withdrawAmounts,
    missingGovTokenBalance,
    txBusy,
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

  const deficitAmount =
    isBNT || !withdrawAmounts
      ? undefined
      : shrinkToken(withdrawAmounts.baseTokenAmount, token.decimals);

  return (
    <div className="w-full max-w-[520px] p-20 space-y-20 md:p-30">
      <TokenBalanceLarge
        symbol={token.symbol}
        amount={
          deficitAmount ? deficitAmount : withdrawRequest.reserveTokenAmount
        }
        loadingAmount={loadingAmounts}
        usdPrice={token.usdPrice}
        logoURI={token.logoURI}
        label="Amount"
        deficitAmount={deficitAmount}
      />
      {!isBNT && (
        <div className="flex gap-10 p-20 text-start text-error bg-error bg-opacity-10 rounded-20">
          <Switch
            selected={isConfirmed}
            onChange={() => setIsConfirmed(!isConfirmed)}
          />
          <div>
            <div className="text-error-hover">
              BNT distribution is currently disabled.
            </div>
            <div>
              If I withdraw now, I expect to receive the amount shown above. I
              understand I may be withdrawing at a loss if the {token.symbol}{' '}
              vault is in deficit.
            </div>
          </div>
        </div>
      )}

      {isPoolStable === false &&
        !isLoading &&
        withdrawRequest.pool.tradingEnabled && (
          <div className="p-20 rounded bg-warning bg-opacity-10">
            <div className="flex items-center font-semibold text-warning">
              <IconInfo className="mr-10 w-14" />
              Withdrawal is temporarily paused!
            </div>
            <div className="ml-[24px] text-secondary">
              The price in the pool is too volatile. Please wait a few minutes
              before proceeding.
            </div>
          </div>
        )}

      {missingGovTokenBalance > 0 ? (
        <div className="p-20 text-center rounded text-error bg-error bg-opacity-30">
          <span className="font-semibold">vBNT Balance insufficient.</span>{' '}
          <br />
          To proceed, add {missingGovTokenBalance} {govToken?.symbol} to your
          wallet.
        </div>
      ) : (
        <Button
          onClick={() => handleWithdrawClick()}
          size={ButtonSize.Full}
          disabled={
            (!isConfirmed && !isBNT) ||
            txBusy ||
            missingGovTokenBalance > 0 ||
            (isPoolStable === false && withdrawRequest.pool.tradingEnabled) ||
            isLoading
          }
          variant={ButtonVariant.Secondary}
        >
          Withdraw
        </Button>
      )}

      <V3WithdrawConfirmInfo handleCancelClick={handleCancelClick} />
    </div>
  );
};

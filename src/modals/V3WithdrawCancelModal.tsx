import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal } from 'modals';
import { Button, ButtonSize } from 'components/button/Button';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { toBigNumber } from 'utils/helperFunctions';

export const V3WithdrawCancelModal = memo(
  ({
    isModalOpen,
    setIsModalOpen,
    withdrawRequest,
    cancelWithdrawal,
  }: {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    withdrawRequest: WithdrawalRequest;
    cancelWithdrawal: () => Promise<void>;
  }) => {
    const [txBusy, setTxBusy] = useState(false);
    const { pool } = withdrawRequest;
    const token = pool.reserveToken;

    const handleCTAClick = useCallback(async () => {
      setTxBusy(true);
      await cancelWithdrawal();
      setIsModalOpen(false);
      setTxBusy(false);
    }, [cancelWithdrawal, setIsModalOpen]);

    const compoundingApr = useMemo(
      () =>
        toBigNumber(pool.apr7d.autoCompounding)
          .plus(pool.apr7d.tradingFees)
          .toFixed(2),
      [pool.apr7d.autoCompounding, pool.apr7d.tradingFees]
    );

    return (
      <Modal
        title="Cancel withdrawal & earn"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        large
      >
        <div className="p-10 md:p-30 space-y-20">
          <TokenBalanceLarge
            symbol={token.symbol}
            amount={withdrawRequest.reserveTokenAmount}
            usdPrice={token.usdPrice}
            logoURI={token.logoURI}
            label={'Amount'}
          />

          <div className="bg-secondary rounded p-20 flex justify-between">
            <div>
              Compounding rewards{' '}
              <span className="text-secondary ml-4">{token.symbol}</span>
            </div>
            <div>{compoundingApr} %</div>
          </div>

          <Button
            onClick={handleCTAClick}
            size={ButtonSize.Full}
            disabled={txBusy}
          >
            Cancel & Earn
          </Button>
        </div>
      </Modal>
    );
  }
);

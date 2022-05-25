import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button } from 'components/button/Button';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { toBigNumber } from 'utils/helperFunctions';

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
        toBigNumber(pool.apr.autoCompounding)
          .plus(pool.apr.tradingFees)
          .toFixed(2),
      [pool.apr.autoCompounding, pool.apr.tradingFees]
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

          <Button onClick={handleCTAClick} className="w-full" disabled={txBusy}>
            Cancel & Earn
          </Button>
        </div>
      </Modal>
    );
  }
);

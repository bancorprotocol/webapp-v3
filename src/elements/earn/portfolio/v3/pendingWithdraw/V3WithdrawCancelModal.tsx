import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button, ButtonSize } from 'components/button/Button';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { toBigNumber } from 'utils/helperFunctions';
import {
  sendWithdrawEvent,
  setCurrentWithdraw,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';
import BigNumber from 'bignumber.js';
import {
  getBlockchain,
  getBlockchainNetwork,
  getCurrency,
} from 'services/api/googleTagManager';

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
      setCurrentWithdraw({
        withdraw_pool: pool.name,
        withdraw_blockchain: getBlockchain(),
        withdraw_blockchain_network: getBlockchainNetwork(),
        withdraw_token: pool.name,
        withdraw_token_amount: withdrawRequest.reserveTokenAmount,
        withdraw_token_amount_usd: new BigNumber(
          withdrawRequest.reserveTokenAmount
        )
          .times(withdrawRequest.pool.reserveToken.usdPrice)
          .toString(),
        withdraw_display_currency: getCurrency(),
      });
      sendWithdrawEvent(WithdrawEvent.WithdrawCancelApproveClick);
      setTxBusy(true);
      await cancelWithdrawal();
      setIsModalOpen(false);
      setTxBusy(false);
    }, [
      cancelWithdrawal,
      setIsModalOpen,
      pool.name,
      withdrawRequest.pool.reserveToken.usdPrice,
      withdrawRequest.reserveTokenAmount,
    ]);

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

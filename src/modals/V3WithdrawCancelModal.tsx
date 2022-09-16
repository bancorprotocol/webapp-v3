import { WithdrawalRequest } from 'store/portfolio/v3Portfolio.types';
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal, ModalNames } from 'modals';
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
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { getModalOpen, getModalData, popModal } from 'store/modals/modals';

interface V3WithdrawCancelProps {
  withdrawRequest: WithdrawalRequest;
  cancelWithdrawal: () => Promise<void>;
}

export const V3WithdrawCancelModal = memo(() => {
  const dispatch = useDispatch();
  const isOpen = useAppSelector((state) =>
    getModalOpen(state, ModalNames.V3WithdrawCancel)
  );

  const props = useAppSelector<V3WithdrawCancelProps | undefined>((state) =>
    getModalData(state, ModalNames.V3WithdrawCancel)
  );

  const onClose = useCallback(() => {
    dispatch(popModal(ModalNames.V3WithdrawCancel));
  }, [dispatch]);

  const [txBusy, setTxBusy] = useState(false);
  const cancelWithdrawal = props?.cancelWithdrawal;
  const withdrawRequest = props?.withdrawRequest;
  const pool = withdrawRequest?.pool;
  const token = pool?.reserveToken;

  const handleCTAClick = useCallback(async () => {
    if (!pool || !withdrawRequest || !cancelWithdrawal) return () => {};

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
    onClose();
    setTxBusy(false);
  }, [onClose, pool, cancelWithdrawal, withdrawRequest]);

  const compoundingApr = useMemo(
    () =>
      pool
        ? toBigNumber(pool.apr7d.autoCompounding)
            .plus(pool.apr7d.tradingFees)
            .toFixed(2)
        : '',
    [pool]
  );

  if (!token || !withdrawRequest) return null;

  return (
    <Modal
      title="Cancel withdrawal & earn"
      isOpen={isOpen}
      setIsOpen={onClose}
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
});

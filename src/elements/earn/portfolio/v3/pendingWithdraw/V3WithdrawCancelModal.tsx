import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { memo, useCallback, useState } from 'react';
import { Modal } from 'components/modal/Modal';
import { Button } from 'components/button/Button';
import { Image } from 'components/image/Image';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';

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
    const { token } = withdrawRequest;

    const handleCTAClick = useCallback(async () => {
      setTxBusy(true);
      await cancelWithdrawal();
      setIsModalOpen(false);
      setTxBusy(false);
    }, [cancelWithdrawal, setIsModalOpen]);

    return (
      <Modal
        title="Cancel withdrawal & earn"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        large
      >
        <div className="p-30 space-y-20">
          <div className="pb-10">
            <div className="text-12 font-semibold mb-10">Amount</div>
            <div className="flex items-center">
              <Image
                alt={'Token Logo'}
                className="w-40 h-40 rounded-full mr-10"
                src={token.logoURI}
              />
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <div className="text-[36px]">
                    {prettifyNumber(withdrawRequest.reserveTokenAmount)}
                  </div>
                  <span className="ml-10">{token.symbol}</span>
                </div>

                <div className="text-secondary">
                  {prettifyNumber(
                    new BigNumber(withdrawRequest.reserveTokenAmount)
                      .times(token.usdPrice)
                      .toString(),
                    true
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-fog rounded p-20 flex justify-between">
            <div>
              Compounding rewards{' '}
              <span className="text-secondary">{token.symbol}</span>
            </div>
            <div>??%</div>
          </div>

          <Button onClick={handleCTAClick} className="w-full" disabled={txBusy}>
            Cancel & Earn
          </Button>
        </div>
      </Modal>
    );
  }
);

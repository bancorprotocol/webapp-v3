import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { Modal } from 'components/modal/Modal';
import { useV3Withdraw } from 'elements/earn/portfolio/v3/withdraw/useV3Withdraw';
import { wait } from 'utils/pureFunctions';

const WithdrawAvailableItem = ({
  withdrawalRequest,
  openCancelModal,
  openConfirmModal,
}: {
  withdrawalRequest: WithdrawalRequest;
  openCancelModal: (req: WithdrawalRequest) => void;
  openConfirmModal: (req: WithdrawalRequest) => void;
}) => {
  const { token, lockEndsAt } = withdrawalRequest;
  const isLocked = useMemo(() => lockEndsAt - dayjs().unix() < 0, [lockEndsAt]);

  return (
    <div className="flex justify-between items-center">
      <TokenBalance
        symbol={token.symbol}
        amount={withdrawalRequest.reserveTokenAmount}
        usdPrice={token.usdPrice ?? '0'}
        imgUrl={token.logoURI}
      />
      <div className="flex items-center space-x-14">
        {isLocked && (
          <Button
            onClick={() => openConfirmModal(withdrawalRequest)}
            size={ButtonSize.EXTRASMALL}
            variant={ButtonVariant.SECONDARY}
          >
            Withdraw
          </Button>
        )}
        {!isLocked && (
          <div className="text-secondary text-12 text-right">
            Cooling down
            <CountdownTimer date={lockEndsAt * 1000} />
          </div>
        )}
        <button
          onClick={() => openCancelModal(withdrawalRequest)}
          className="hover:text-error p-10"
        >
          <IconTimes className="w-10" />
        </button>
      </div>
    </div>
  );
};

const WithdrawCancelModal = ({
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
  const { token, reserveTokenAmount } = withdrawRequest;
  const handleCTAClick = async () => {
    setTxBusy(true);
    await cancelWithdrawal();
    setIsModalOpen(false);
    setTxBusy(false);
  };
  return (
    <Modal
      title="Cancel withdrawl & earn"
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
    >
      <div className="p-20 space-y-20">
        <TokenBalance
          symbol={token.symbol}
          amount={reserveTokenAmount}
          usdPrice={token.usdPrice ?? '0'}
          imgUrl={token.logoURI}
        />
        <Button onClick={handleCTAClick} className="w-full" disabled={txBusy}>
          Cancel Withdrawal
        </Button>
      </div>
    </Modal>
  );
};

const WithdrawConfirmModal = ({
  isModalOpen,
  setIsModalOpen,
  withdrawRequest,
  withdraw,
  openCancelModal,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  withdraw: () => Promise<void>;
  openCancelModal: (req: WithdrawalRequest) => void;
}) => {
  const [txBusy, setTxBusy] = useState(false);
  const { token, reserveTokenAmount } = withdrawRequest;
  const handleCTAClick = async () => {
    setTxBusy(true);
    try {
      await withdraw();
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalOpen(false);
      setTxBusy(false);
    }
  };
  const handleCancelClick = async () => {
    setIsModalOpen(false);
    await wait(400);
    openCancelModal(withdrawRequest);
  };

  return (
    <Modal
      title="Confirm Withdraw"
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
    >
      <div className="p-20 space-y-20">
        <TokenBalance
          symbol={token.symbol}
          amount={reserveTokenAmount}
          usdPrice={token.usdPrice ?? '0'}
          imgUrl={token.logoURI}
        />
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={handleCancelClick}
          className="w-full"
          disabled={txBusy}
        >
          Cancel
        </Button>
        <Button onClick={handleCTAClick} className="w-full" disabled={txBusy}>
          Confirm Withdrawal
        </Button>
      </div>
    </Modal>
  );
};

export const V3Withdraw = () => {
  const {
    withdrawalRequests,
    cancelWithdrawal,
    openCancelModal,
    isLoadingWithdrawalRequests,
    isModalCancelOpen,
    setIsModalCancelOpen,
    isModalConfirmOpen,
    setIsModalConfirmOpen,
    selected,
    openConfirmModal,
    withdraw,
  } = useV3Withdraw();

  return (
    <>
      <section className="content-block p-14">
        <h2 className="text-12 text-secondary font-normal mb-10">
          Pending Withdrawals
        </h2>
        <div className="space-y-10">
          {withdrawalRequests.map((withdrawalRequest) => (
            <WithdrawAvailableItem
              withdrawalRequest={withdrawalRequest}
              key={withdrawalRequest.id}
              openCancelModal={openCancelModal}
              openConfirmModal={openConfirmModal}
            />
          ))}
          {isLoadingWithdrawalRequests &&
            [...Array(5)].map((_, index) => (
              <div key={index} className="loading-skeleton w-full h-[30px]" />
            ))}
        </div>
        {withdrawalRequests.length === 0 && !isLoadingWithdrawalRequests && (
          <div className="text-center text-primary text-12 py-20">
            No pending withdrawals
          </div>
        )}
      </section>
      {selected && (
        <>
          <WithdrawCancelModal
            isModalOpen={isModalCancelOpen}
            setIsModalOpen={setIsModalCancelOpen}
            withdrawRequest={selected!}
            cancelWithdrawal={cancelWithdrawal}
          />
          <WithdrawConfirmModal
            isModalOpen={isModalConfirmOpen}
            setIsModalOpen={setIsModalConfirmOpen}
            withdrawRequest={selected!}
            withdraw={withdraw}
            openCancelModal={openCancelModal}
          />
        </>
      )}
    </>
  );
};

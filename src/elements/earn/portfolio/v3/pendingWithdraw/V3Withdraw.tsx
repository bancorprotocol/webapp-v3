import { useV3Withdraw } from 'elements/earn/portfolio/v3/pendingWithdraw/useV3Withdraw';
import { WithdrawItem } from 'elements/earn/portfolio/v3/pendingWithdraw/V3WithdrawItem';
import { V3WithdrawCancelModal } from 'elements/earn/portfolio/v3/pendingWithdraw/V3WithdrawCancelModal';
import { V3WithdrawConfirmModal } from 'elements/earn/portfolio/v3/pendingWithdraw/confirm/V3WithdrawConfirmModal';

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
  } = useV3Withdraw();

  return (
    <>
      <section className="content-block p-14">
        <h2 className="text-12 text-secondary mb-20 hidden md:block">
          Pending Withdrawals
        </h2>
        <div className="space-y-10">
          {withdrawalRequests.map((withdrawalRequest) => (
            <WithdrawItem
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
          <V3WithdrawCancelModal
            isModalOpen={isModalCancelOpen}
            setIsModalOpen={setIsModalCancelOpen}
            withdrawRequest={selected!}
            cancelWithdrawal={cancelWithdrawal}
          />
          <V3WithdrawConfirmModal
            isModalOpen={isModalConfirmOpen}
            setIsModalOpen={setIsModalConfirmOpen}
            withdrawRequest={selected!}
            openCancelModal={openCancelModal}
          />
        </>
      )}
    </>
  );
};

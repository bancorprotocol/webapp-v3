import { useV3Withdraw } from 'elements/earn/portfolio/v3/pendingWithdraw/useV3Withdraw';
import { WithdrawItem } from 'elements/earn/portfolio/v3/pendingWithdraw/V3WithdrawItem';

export const V3Withdraw = () => {
  const {
    withdrawalRequests,
    openCancelModal,
    isLoadingWithdrawalRequests,
    openConfirmModal,
  } = useV3Withdraw();

  return (
    <>
      {withdrawalRequests.length !== 0 && (
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
              [...Array(3)].map((_, index) => (
                <div key={index} className="loading-skeleton w-full h-[30px]" />
              ))}
          </div>
        </section>
      )}
    </>
  );
};

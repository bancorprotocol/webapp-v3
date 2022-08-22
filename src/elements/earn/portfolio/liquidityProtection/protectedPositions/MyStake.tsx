import { useAppSelector } from 'store';
import { getStakeSummary, MyStakeSummary } from 'store/liquidity/liquidity';
import { prettifyNumber } from 'utils/helperFunctions';

export const MyStake = ({ loading }: { loading: boolean }) => {
  const summary = useAppSelector<MyStakeSummary | undefined>(getStakeSummary);

  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light dark:border-primary-dark">
      <h2 className="ml-[20px] md:ml-[33px]">My Stake</h2>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between items-center h-44 md:ml-[34px] md:mr-[44px] mx-15">
        {loading ? (
          <div className="loading-skeleton h-20 w-[100px] md:w-[120px]"></div>
        ) : (
          <div>
            <div className="mb-5">Protected Value</div>
            <div className="font-semibold text-16 text-primary dark:text-primary-light">
              {summary
                ? `${prettifyNumber(summary.protectedValue, true)}`
                : '--'}
            </div>
          </div>
        )}
        {loading ? (
          <div className="loading-skeleton h-20 w-[100px] md:w-[120px]"></div>
        ) : (
          <div>
            <div className="mb-5">Claimable Value</div>
            <div className="font-semibold text-16 text-primary dark:text-primary-light">
              {summary
                ? `${prettifyNumber(summary.claimableValue, true)}`
                : '--'}
            </div>
          </div>
        )}
        {loading ? (
          <div className="loading-skeleton h-20 w-[100px] md:w-[120px]"></div>
        ) : (
          <div>
            <div className="mb-5">Total Fees</div>
            <div className="font-semibold text-16 text-primary dark:text-primary-light">
              {summary ? `${prettifyNumber(summary.fees, true)}` : '--'}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

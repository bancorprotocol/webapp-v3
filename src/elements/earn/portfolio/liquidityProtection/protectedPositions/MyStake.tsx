import { useAppSelector } from 'redux/index';
import { getStakeSummary, MyStakeSummary } from 'redux/liquidity/liquidity';
import { prettifyNumber } from 'utils/helperFunctions';

export const MyStake = () => {
  const summary = useAppSelector<MyStakeSummary | undefined>(getStakeSummary);

  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light">
      <h2 className="ml-[20px] md:ml-[33px]">My Stake</h2>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between md:ml-[34px] md:mr-[44px]">
        <div>
          <div className="mb-5">Protected Value</div>
          <div className="text-16 text-primary font-semibold">
            {summary
              ? `~${prettifyNumber(summary.protectedValue, true)}`
              : '--'}
          </div>
        </div>
        <div>
          <div className="mb-5">Claimable Value</div>
          <div className="text-16 text-primary font-semibold">
            {summary
              ? `~${prettifyNumber(summary.claimableValue, true)}`
              : '--'}
          </div>
        </div>
        <div>
          <div className="mb-5">Total Fees</div>
          <div className="text-16 text-primary font-semibold">
            {summary ? `~${prettifyNumber(summary.fees, true)}` : '--'}
          </div>
        </div>
      </div>
    </section>
  );
};

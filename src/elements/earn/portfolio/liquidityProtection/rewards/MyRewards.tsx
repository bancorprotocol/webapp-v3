import { prettifyNumber } from 'utils/helperFunctions';
import { NavLink } from 'react-router-dom';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { StakeRewardsBtn } from 'elements/earn/portfolio/liquidityProtection/rewards/StakeRewardsBtn';

export const MyRewards = () => {
  const [totalRewards, totalRewardsUsd, claimableRewards, claimableRewardsUsd] =
    useMyRewards();

  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light">
      <div className="flex justify-between items-center">
        <h2 className="ml-[20px] md:ml-[33px]">Rewards</h2>
        <div className="flex mr-[20px] md:mr-[44px] space-x-8">
          <NavLink
            to="/portfolio/rewards/claim"
            className="btn-outline-primary btn-sm rounded-[12px]"
          >
            Claim
          </NavLink>
          <StakeRewardsBtn
            buttonLabel="Stake"
            buttonClass="btn-primary btn-sm rounded-[12px]"
          />
        </div>
      </div>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between md:ml-[34px] md:mr-[44px]">
        <div>
          <div className="mb-5">Total Rewards to Date</div>
          {totalRewards && totalRewardsUsd ? (
            <div>
              <span className="md:text-16 font-semibold mr-5">
                {prettifyNumber(totalRewards)} BNT
              </span>
              <span className="text-12 text-primary">
                (~
                {prettifyNumber(totalRewardsUsd, true)})
              </span>
            </div>
          ) : (
            <div>
              <span className="md:text-16 font-semibold mr-5">--</span>
            </div>
          )}
        </div>
        <div>
          <div className="mb-5">Claimable Rewards</div>
          {claimableRewards && claimableRewardsUsd ? (
            <div>
              <span className="md:text-16 font-semibold mr-5">
                {prettifyNumber(claimableRewards)} BNT
              </span>
              <span className="text-12 text-primary">
                (~
                {prettifyNumber(claimableRewardsUsd, true)})
              </span>
            </div>
          ) : (
            <div>
              <span className="md:text-16 font-semibold mr-5">--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

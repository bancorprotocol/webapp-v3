import { prettifyNumber } from 'utils/helperFunctions';
import { Link } from 'react-router-dom';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { StakeRewardsBtn } from 'elements/earn/portfolio/liquidityProtection/rewards/StakeRewardsBtn';
import { useAppSelector } from 'store';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { BancorURL } from 'router/bancorURL.service';

export const MyRewards = () => {
  const [totalRewards, totalRewardsUsd, claimableRewards, claimableRewardsUsd] =
    useMyRewards();
  const loading = useAppSelector<boolean>(
    (state) => state.liquidity.loadingRewards
  );

  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light dark:border-primary-dark">
      <div className="flex justify-between items-center">
        <h2 className="ml-[20px] md:ml-[33px]">Rewards</h2>
        <div className="flex mr-[20px] md:mr-[44px] space-x-8">
          <Link to={BancorURL.portfolioV2RewardsClaim}>
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.EXTRASMALL}
            >
              Claim
            </Button>
          </Link>
          <StakeRewardsBtn
            buttonLabel="Stake"
            buttonClass="btn btn-primary btn-xs"
          />
        </div>
      </div>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between items-center h-44 md:ml-[34px] md:mr-[44px] mx-15">
        {loading ? (
          <div className="loading-skeleton h-20 w-[120px] md:w-[200px]"></div>
        ) : (
          <div>
            <div className="mb-5">Total Rewards to Date</div>
            {totalRewards && totalRewardsUsd ? (
              <div>
                <span className="md:text-16 font-semibold mr-5">
                  {prettifyNumber(totalRewards)} BNT
                </span>
                <span className="text-12 text-primary dark:text-primary-light">
                  (~
                  {prettifyNumber(totalRewardsUsd, true)})
                </span>
              </div>
            ) : (
              <div>
                <span className="md:text-16 text-primary dark:text-primary-light font-semibold mr-5">
                  --
                </span>
              </div>
            )}
          </div>
        )}
        {loading ? (
          <div className="loading-skeleton h-20 w-[120px] md:w-[200px]"></div>
        ) : (
          <div>
            <div className="mb-5">Claimable Rewards</div>
            {claimableRewards && claimableRewardsUsd ? (
              <div>
                <span className="md:text-16 font-semibold mr-5">
                  {prettifyNumber(claimableRewards)} BNT
                </span>
                <span className="text-12 text-primary dark:text-primary-light">
                  (~
                  {prettifyNumber(claimableRewardsUsd, true)})
                </span>
              </div>
            ) : (
              <div>
                <span className="md:text-16 text-primary dark:text-primary-light font-semibold mr-5">
                  --
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

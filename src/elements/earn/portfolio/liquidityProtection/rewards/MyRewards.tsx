import { prettifyNumber } from 'utils/helperFunctions';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { ReactComponent as IconMore } from 'assets/icons/more.svg';
import { Link } from 'react-router-dom';
import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { StakeRewardsBtn } from './StakeRewardsBtn';
import { BancorURL } from 'router/bancorURL.service';

export const MyRewards = () => {
  const {
    totalRewards,
    totalRewardsUsd,
    claimableRewards,
    claimableRewardsUsd,
    loading,
  } = useMyRewards();

  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light dark:border-primary-dark">
      <div className="flex items-center justify-between">
        <h2 className="ml-[20px] md:ml-[33px]">Rewards</h2>
        <div className="flex items-center mr-[20px] md:mr-[44px] space-x-8">
          <StakeRewardsBtn
            buttonLabel="Stake to V3"
            buttonClass="btn btn-primary btn-xs"
          />
          <Popover className="relative block">
            <Popover.Button>
              <IconMore className="w-16 rotate-90" />
            </Popover.Button>
            <DropdownTransition>
              <Popover.Panel
                className="p-10 text-center w-[105px] h-[44px] dropdown-menu"
                static
              >
                <Link to={BancorURL.portfolioV2RewardsClaim}>Claim</Link>
              </Popover.Panel>
            </DropdownTransition>
          </Popover>
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
                <span className="mr-5 font-semibold md:text-16">
                  {prettifyNumber(totalRewards)} BNT
                </span>
                <span className="text-12 text-primary dark:text-primary-light">
                  (~
                  {prettifyNumber(totalRewardsUsd, true)})
                </span>
              </div>
            ) : (
              <div>
                <span className="mr-5 font-semibold md:text-16 text-primary dark:text-primary-light">
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
                <span className="mr-5 font-semibold md:text-16">
                  {prettifyNumber(claimableRewards)} BNT
                </span>
                <span className="text-12 text-primary dark:text-primary-light">
                  (~
                  {prettifyNumber(claimableRewardsUsd, true)})
                </span>
              </div>
            ) : (
              <div>
                <span className="mr-5 font-semibold md:text-16 text-primary dark:text-primary-light">
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

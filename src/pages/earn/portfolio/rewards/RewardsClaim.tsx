import { Widget } from 'components/widgets/Widget';
import { RewardsClaimAmount } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimAmount';
import { RewardsClaimInfo } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimInfo';
import { useRewardsClaim } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/useRewardsClaim';
import { RewardsClaimCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimCTA';
import { useNavigation } from 'hooks/useNavigation';

export const RewardsClaim = () => {
  const { claimableRewards, account } = useRewardsClaim({});
  const { goToPage } = useNavigation();

  return (
    <div className="pt-40 md:pt-[100px]">
      <Widget title="Claim Rewards" goBack={goToPage.portfolioV2}>
        <div className="px-10 pb-10">
          <RewardsClaimInfo />
          <RewardsClaimAmount amount={claimableRewards} />
          <RewardsClaimCTA
            account={account}
            claimableRewards={claimableRewards}
          />
        </div>
      </Widget>
    </div>
  );
};

import { Widget } from 'components/widgets/Widget';
import { RewardsClaimAmount } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimAmount';
import { RewardsClaimInfo } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimInfo';
import { useRewardsClaim } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/useRewardsClaim';
import { RewardsClaimCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimCTA';
import { useNavigation } from 'services/router';

export const RewardsClaim = () => {
  const { claimableRewards, account } = useRewardsClaim({});
  const { pushPortfolio } = useNavigation();

  return (
    <Widget title="Claim Rewards" goBack={pushPortfolio}>
      <div className="px-10 pb-10">
        <RewardsClaimInfo />
        <RewardsClaimAmount amount={claimableRewards} />
        <RewardsClaimCTA
          account={account}
          claimableRewards={claimableRewards}
        />
      </div>
    </Widget>
  );
};

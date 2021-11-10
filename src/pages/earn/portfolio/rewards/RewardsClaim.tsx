import { Widget } from 'components/widgets/Widget';
import { RewardsClaimAmount } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimAmount';
import { RewardsClaimInfo } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimInfo';
import { useRewardsClaim } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/useRewardsClaim';
import { RewardsClaimCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimCTA';

export const RewardsClaim = () => {
  const { claimableRewards, account } = useRewardsClaim({});

  return (
    <Widget title="Claim Rewards" goBackRoute="/portfolio">
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

import { Widget } from 'components/widgets/Widget';
import { RewardsClaimAmount } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimAmount';
import { RewardsClaimCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimCTA';
import { useNavigation } from 'hooks/useNavigation';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { useAppSelector } from 'store';

export const RewardsClaim = () => {
  const account = useAppSelector((state) => state.user.account);
  const { claimableRewards } = useMyRewards();
  const { goToPage } = useNavigation();

  return (
    <div className="pt-40 md:pt-[100px]">
      <Widget title="Claim Rewards" goBack={goToPage.portfolioV2}>
        <div className="px-10 pb-10">
          <RewardsClaimAmount amount={claimableRewards.toString()} />
          <RewardsClaimCTA account={account} />
        </div>
      </Widget>
    </div>
  );
};

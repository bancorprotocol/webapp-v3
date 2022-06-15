import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { useAppSelector } from 'store';
import { getUserRewardsProof } from 'store/liquidity/liquidity';

interface Props {
  claimableRewards?: string;
  account?: string | null;
}

export const RewardsClaimCTA = ({ account }: Props) => {
  const { userRewards, hasClaimed, stakeRewardsToV3, claimRewardsToWallet } =
    useMyRewards();
  const proof = useAppSelector(getUserRewardsProof);
  const canClaim =
    !hasClaimed && !!account && userRewards.claimable !== '0' && proof;

  return (
    <>
      <Button
        onClick={stakeRewardsToV3}
        size={ButtonSize.Full}
        disabled={!canClaim}
        className="mt-20"
      >
        Stake my Rewards to Bancor V3
      </Button>
      <Button
        variant={ButtonVariant.Secondary}
        onClick={claimRewardsToWallet}
        size={ButtonSize.Full}
        className="mt-10"
        disabled={!canClaim}
      >
        Withdraw Rewards
      </Button>
    </>
  );
};

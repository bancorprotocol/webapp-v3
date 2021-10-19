import { claimRewards } from 'services/web3/protection/rewards';
import { StakeRewardsBtn } from 'elements/earn/portfolio/liquidityProtection/rewards/StakeRewardsBtn';

interface Props {
  claimableRewards: string | null;
  account?: string | null;
}

export const RewardsClaimCTA = ({ claimableRewards, account }: Props) => {
  const handleClaim = async () => {
    if (account) {
      const txHash = await claimRewards();
    }
  };

  return (
    <>
      <StakeRewardsBtn
        buttonLabel="Stake my Rewards"
        buttonClass="btn-primary rounded w-full mt-20"
      />
      <button
        onClick={() => handleClaim()}
        className="btn-outline-primary rounded w-full mt-10"
        disabled={!account}
      >
        Withdraw Rewards
      </button>
    </>
  );
};

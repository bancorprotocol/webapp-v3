import { claimRewards } from 'services/web3/protection/rewards';
import { StakeRewardsBtn } from 'elements/earn/portfolio/liquidityProtection/rewards/StakeRewardsBtn';
import {
  claimRewardsFailedNotification,
  claimRewardsNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { useNavigation } from 'services/router';

interface Props {
  claimableRewards: string | null;
  account?: string | null;
}

export const RewardsClaimCTA = ({ claimableRewards, account }: Props) => {
  const dispatch = useDispatch();
  const { pushPortfolio } = useNavigation();

  const handleClaim = async () => {
    if (account && claimableRewards) {
      try {
        const txHash = await claimRewards();
        claimRewardsNotification(dispatch, txHash, claimableRewards);
        pushPortfolio();
      } catch (e: any) {
        console.error('Claiming Rewards failed with msg: ', e.message);
        claimRewardsFailedNotification(dispatch);
      }
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

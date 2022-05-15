import {
  claimRewards,
  stakeSnapshotRewards,
} from 'services/web3/protection/rewards';
import {
  claimRewardsFailedNotification,
  claimRewardsNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useNavigation } from 'hooks/useNavigation';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { useAppSelector } from 'store';
import { getUserRewardsProof } from 'store/liquidity/liquidity';

interface Props {
  claimableRewards?: string;
  account?: string | null;
}

export const RewardsClaimCTA = ({ claimableRewards, account }: Props) => {
  const dispatch = useDispatch();
  const { goToPage } = useNavigation();
  const { userRewards, hasClaimed, handleClaimed } = useMyRewards();
  const proof = useAppSelector(getUserRewardsProof);
  const canClaim =
    !hasClaimed && !!account && userRewards.claimable !== '0' && proof;

  const handleClaim = async () => {
    if (account && claimableRewards) {
      try {
        const txHash = await claimRewards();
        claimRewardsNotification(dispatch, txHash, claimableRewards);
        goToPage.portfolioV2();
      } catch (e: any) {
        console.error('Claiming Rewards failed with msg: ', e.message);
        claimRewardsFailedNotification(dispatch);
      }
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          if (canClaim) {
            stakeSnapshotRewards(
              account,
              userRewards.claimable,
              proof,
              (txHash: string) => {
                console.log('txHash', txHash);
              },
              (txHash: string) => {
                handleClaimed();
                claimRewardsNotification(
                  dispatch,
                  txHash,
                  userRewards.claimable
                );
                goToPage.portfolioV2();
              },
              () => rejectNotification(dispatch),
              () => {
                claimRewardsFailedNotification(dispatch);
              }
            );
          }
        }}
        size={ButtonSize.SMALL}
        disabled={!canClaim}
        className="w-full mt-20 btn btn-primary btn-lg"
      >
        Stake my Rewards to Bancor V3
      </Button>
      <Button
        variant={ButtonVariant.SECONDARY}
        onClick={() => handleClaim()}
        className="w-full mt-10"
        disabled={!account}
      >
        Withdraw Rewards
      </Button>
    </>
  );
};

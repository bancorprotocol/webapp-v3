import {
  claimSnapshotRewards,
  stakeSnapshotRewards,
} from 'services/web3/protection/rewards';
import {
  claimRewardsFailedNotification,
  rewardsStakedToV3Notification,
  rewardsClaimedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useNavigation } from 'hooks/useNavigation';
import { useMyRewards } from 'elements/earn/portfolio/liquidityProtection/rewards/useMyRewards';
import { useAppSelector } from 'store';
import { getUserRewardsProof } from 'store/liquidity/liquidity';
import { prettifyNumber } from 'utils/helperFunctions';

interface Props {
  claimableRewards?: string;
  account?: string | null;
}

export const RewardsClaimCTA = ({ account }: Props) => {
  const dispatch = useDispatch();
  const { goToPage } = useNavigation();
  const { userRewards, hasClaimed, handleClaimed, claimableRewards } =
    useMyRewards();
  const proof = useAppSelector(getUserRewardsProof);
  const canClaim =
    !hasClaimed && !!account && userRewards.claimable !== '0' && proof;

  const handleClaim = async () => {
    if (canClaim) {
      claimSnapshotRewards(
        account,
        userRewards.claimable,
        proof,
        (txHash: string) => {
          console.log('txHash', txHash);
        },
        (txHash: string) => {
          handleClaimed();
          rewardsClaimedNotification(
            dispatch,
            txHash,
            prettifyNumber(claimableRewards)
          );
          goToPage.portfolioV2();
        },
        () => rejectNotification(dispatch),
        () => {
          claimRewardsFailedNotification(dispatch);
        }
      );
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
                rewardsStakedToV3Notification(
                  dispatch,
                  txHash,
                  prettifyNumber(claimableRewards)
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
        disabled={!canClaim}
      >
        Withdraw Rewards
      </Button>
    </>
  );
};

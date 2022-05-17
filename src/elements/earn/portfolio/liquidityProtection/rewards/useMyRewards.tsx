import { useAppSelector } from 'store';
import BigNumber from 'bignumber.js';
import { getTokenById } from 'store/bancor/bancor';
import { bntDecimals, bntToken } from 'services/web3/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { shrinkToken } from 'utils/formulas';
import {
  getUserRewardsFromSnapshot,
  getUserRewardsProof,
} from 'store/liquidity/liquidity';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  claimSnapshotRewards,
  stakeSnapshotRewards,
} from 'services/web3/protection/rewards';
import {
  claimRewardsFailedNotification,
  rejectNotification,
  rewardsClaimedNotification,
  rewardsStakedToV3Notification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { prettifyNumber } from 'utils/helperFunctions';
import { useNavigation } from 'hooks/useNavigation';

export const useMyRewards = () => {
  const bnt = useAppSelector((state) => getTokenById(state, bntToken));
  const snapshots = useAppSelector((state) => state.liquidity.snapshots);
  const userRewards = useAppSelector(getUserRewardsFromSnapshot);
  const account = useAppSelector((state) => state.user.account);
  const proof = useAppSelector(getUserRewardsProof);
  const dispatch = useDispatch();
  const { goToPage } = useNavigation();
  const [hasClaimed, setHasClaimed] = useState(true);

  const handleClaimed = useCallback(async () => {
    const userClaimed = account
      ? await ContractsApi.StakingRewardsClaim.read.hasClaimed(account)
      : true;
    setHasClaimed(userClaimed);
  }, [account]);

  useEffect(() => {
    handleClaimed();
  }, [handleClaimed]);

  const claimable = useMemo(() => {
    return shrinkToken(userRewards.claimable, bntDecimals);
  }, [userRewards.claimable]);

  const claimed = useMemo(() => {
    return shrinkToken(userRewards.totalClaimed, bntDecimals);
  }, [userRewards.totalClaimed]);

  const totalRewards = useMemo(() => {
    return new BigNumber(claimable).plus(claimed);
  }, [claimable, claimed]);

  const totalRewardsUsd = useMemo(() => {
    return totalRewards.times(bnt?.usdPrice ?? 0);
  }, [bnt?.usdPrice, totalRewards]);

  const claimableRewards = useMemo(() => {
    return new BigNumber(claimable);
  }, [claimable]);

  const claimableRewardsUsd = useMemo(() => {
    return claimableRewards.times(bnt?.usdPrice ?? 0);
  }, [bnt?.usdPrice, claimableRewards]);

  const canClaim =
    !hasClaimed && !!account && userRewards.claimable !== '0' && proof;

  const stakeRewardsToV3 = useCallback(async () => {
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
          goToPage.portfolio();
        },
        () => rejectNotification(dispatch),
        () => {
          claimRewardsFailedNotification(dispatch);
        }
      );
    }
  }, [
    account,
    canClaim,
    claimableRewards,
    dispatch,
    goToPage,
    handleClaimed,
    proof,
    userRewards.claimable,
  ]);

  const claimRewardsToWallet = useCallback(async () => {
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
  }, [
    account,
    canClaim,
    claimableRewards,
    dispatch,
    goToPage,
    handleClaimed,
    proof,
    userRewards.claimable,
  ]);

  return {
    totalRewards,
    totalRewardsUsd,
    claimableRewards,
    claimableRewardsUsd,
    loading: !snapshots,
    userRewards,
    hasClaimed,
    handleClaimed,
    stakeRewardsToV3,
    claimRewardsToWallet,
  };
};

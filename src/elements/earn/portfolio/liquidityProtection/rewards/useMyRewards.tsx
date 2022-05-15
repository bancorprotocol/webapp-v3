import { useAppSelector } from 'store';
import BigNumber from 'bignumber.js';
import { getTokenById } from 'store/bancor/bancor';
import { bntDecimals, bntToken } from 'services/web3/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { shrinkToken } from 'utils/formulas';
import { getUserRewardsFromSnapshot } from 'store/liquidity/liquidity';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const useMyRewards = () => {
  const bnt = useAppSelector((state) => getTokenById(state, bntToken));
  const snapshots = useAppSelector((state) => state.liquidity.snapshots);
  const userRewards = useAppSelector(getUserRewardsFromSnapshot);
  const account = useAppSelector((state) => state.user.account);
  const [hasClaimed, setHasClaimed] = useState(false);

  const handleClaimed = useCallback(async () => {
    const userClaimed = account
      ? await ContractsApi.StakingRewardsClaim.read.hasClaimed(account)
      : false;
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

  return {
    totalRewards,
    totalRewardsUsd,
    claimableRewards,
    claimableRewardsUsd,
    loading: !snapshots,
    userRewards,
    hasClaimed,
    handleClaimed,
  };
};

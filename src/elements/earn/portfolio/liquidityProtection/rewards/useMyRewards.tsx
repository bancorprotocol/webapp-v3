import { useAppSelector } from 'store';
import BigNumber from 'bignumber.js';
import { getTokenById } from 'store/bancor/bancor';
import { bntDecimals, bntToken } from 'services/web3/config';
import { useMemo } from 'react';
import { shrinkToken } from 'utils/formulas';
import { getUserRewardsFromSnapshot } from 'store/liquidity/liquidity';

export const useMyRewards = () => {
  const bnt = useAppSelector((state) => getTokenById(state, bntToken));
  const userRewards = useAppSelector(getUserRewardsFromSnapshot);

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
    loading: !userRewards,
  };
};

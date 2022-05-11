import { useAppSelector } from 'store';
import BigNumber from 'bignumber.js';
// import { Rewards } from 'services/observables/liquidity';
import { getTokenById } from 'store/bancor/bancor';
import { bntToken } from 'services/web3/config';
import axios from 'axios';
import useAsyncEffect from 'use-async-effect';
import { useMemo, useState } from 'react';
import { shrinkToken } from 'utils/formulas';

export const useMyRewards = () => {
  const [loading, setLoading] = useState(true);
  const bnt = useAppSelector((state) => getTokenById(state, bntToken));
  const account = useAppSelector((state) => state.user.account);
  const [snapshots, setSnapshots] = useState<any>({});
  // const rewards = useAppSelector<Rewards | undefined>(
  //   (state) => state.liquidity.rewards
  // );
  const userRewards = useMemo(() => {
    if (!account) return null;
    return snapshots[account] || null;
  }, [account, snapshots]);

  const claimable = useMemo(() => {
    return shrinkToken(userRewards?.claimable ?? 0, bnt?.decimals ?? 18);
  }, [bnt?.decimals, userRewards?.claimable]);

  const claimed = useMemo(() => {
    return shrinkToken(userRewards?.totalClaimed ?? 0, bnt?.decimals ?? 18);
  }, [bnt?.decimals, userRewards?.totalClaimed]);

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

  useAsyncEffect(async () => {
    try {
      const res = await axios.get('/rewards-snapshot.min.json', {
        timeout: 10000,
      });
      setSnapshots(res.data);
      setLoading(false);
    } catch (e) {
      console.log('failed to fetch rewards snapshots', e);
      setLoading(false);
    }
  }, []);

  return {
    totalRewards,
    totalRewardsUsd,
    claimableRewards,
    claimableRewardsUsd,
    loading,
  };
};

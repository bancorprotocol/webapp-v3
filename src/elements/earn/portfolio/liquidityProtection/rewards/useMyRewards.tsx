import { useAppSelector } from 'store';
import BigNumber from 'bignumber.js';
import { Rewards } from 'services/observables/liquidity';
import { getTokenById } from 'store/bancor/bancor';
import { bntToken } from 'services/web3/config';
import axios from 'axios';
import useAsyncEffect from 'use-async-effect';

export const useMyRewards = () => {
  const bnt = useAppSelector((state) => getTokenById(state, bntToken));
  const rewards = useAppSelector<Rewards | undefined>(
    (state) => state.liquidity.rewards
  );

  useAsyncEffect(async () => {
    try {
      const res = await axios.get('/rewards-snapshot.json', { timeout: 10000 });
      console.log('snapshots:', res);
    } catch (e) {
      console.log('failed to fetch rewards snapshots', e);
    }
  }, []);

  const totalRewardsUsd = new BigNumber(
    rewards ? rewards.totalRewards : 0
  ).times(bnt?.usdPrice ?? 0);
  const claimableRewardsUsd = new BigNumber(
    rewards ? rewards.pendingRewards : 0
  ).times(bnt?.usdPrice ?? 0);

  return [
    rewards?.totalRewards,
    totalRewardsUsd,
    rewards?.pendingRewards,
    claimableRewardsUsd,
  ];
};

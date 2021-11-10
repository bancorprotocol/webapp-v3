import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';
import { Rewards } from 'services/observables/liquidity';

export const useMyRewards = () => {
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );
  const rewards = useAppSelector<Rewards | undefined>(
    (state) => state.liquidity.rewards
  );

  const totalRewardsUsd = new BigNumber(
    rewards ? rewards.totalRewards : 0
  ).times(bntPrice ?? 0);
  const claimableRewardsUsd = new BigNumber(
    rewards ? rewards.pendingRewards : 0
  ).times(bntPrice ?? 0);

  return [
    rewards?.totalRewards,
    totalRewardsUsd,
    rewards?.pendingRewards,
    claimableRewardsUsd,
  ];
};

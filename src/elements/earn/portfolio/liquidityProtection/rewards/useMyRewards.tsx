import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { useAppSelector } from 'redux/index';
import {
  fetchPendingRewards,
  fetchTotalClaimedRewards,
} from 'services/web3/protection/rewards';
import BigNumber from 'bignumber.js';
import { useInterval } from 'hooks/useInterval';

export const useMyRewards = () => {
  const { account } = useWeb3React();
  const [claimableRewards, setClaimableRewards] = useState<number | null>(null);
  const [totalRewards, setTotalRewards] = useState<number | null>(null);
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );

  const fetchRewardsData = async (account: string) => {
    const pendingRewards = await fetchPendingRewards(account);
    const claimedRewards = await fetchTotalClaimedRewards(account);

    setClaimableRewards(Number(pendingRewards));
    const totalRewards = new BigNumber(pendingRewards)
      .plus(claimedRewards)
      .toString();
    setTotalRewards(Number(totalRewards));
  };

  useInterval(
    async () => {
      if (account) {
        await fetchRewardsData(account);
      }
    },
    account ? 15000 : null
  );

  useEffect(() => {
    if (!account) {
      setClaimableRewards(null);
      setTotalRewards(null);
    }
  }, [account]);

  const totalRewardsUsd = new BigNumber(totalRewards ?? 0).times(bntPrice ?? 0);
  const claimableRewardsUsd = new BigNumber(claimableRewards ?? 0).times(
    bntPrice ?? 0
  );

  return [totalRewards, totalRewardsUsd, claimableRewards, claimableRewardsUsd];
};

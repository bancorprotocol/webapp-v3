import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { fetchPendingRewards } from 'services/web3/protection/rewards';
import { useInterval } from 'hooks/useInterval';

export const useRewardsClaim = () => {
  const [claimableRewards, setClaimableRewards] = useState<string | null>(null);
  const { account } = useWeb3React();

  const fetchClaimableRewards = async (account: string) => {
    const pendingRewards = await fetchPendingRewards(account);
    setClaimableRewards(pendingRewards);
  };

  useInterval(
    async () => {
      if (account) {
        await fetchClaimableRewards(account);
      }
    },
    account ? 15000 : null
  );

  useEffect(() => {
    if (!account) {
      setClaimableRewards(null);
    }
  }, [account]);

  return [claimableRewards, account] as [
    string | null,
    string | null | undefined
  ];
};

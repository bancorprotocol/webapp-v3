import { Widget } from 'components/widgets/Widget';
import { RewardsClaimAmount } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimAmount';
import { RewardsClaimInfo } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimInfo';
import { useRewardsClaim } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/useRewardsClaim';
import { RewardsClaimCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/RewardsClaimCTA';
import { useWeb3React } from '@web3-react/core';
import { useInterval } from 'hooks/useInterval';
import { useState, useEffect } from 'react';
import { useAppSelector } from 'redux/index';
import {
  fetchPendingRewards,
  claimRewards,
} from 'services/web3/protection/rewards';

export const RewardsClaim = () => {
  const [claimableRewards, setClaimableRewards] = useState<number | null>(null);
  const { account } = useWeb3React();
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );

  const fetchClaimableRewards = async (account: string) => {
    const pendingRewards = await fetchPendingRewards(account);
    setClaimableRewards(Number(pendingRewards));
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

  const handleClaim = async () => {
    if (account) {
      const txHash = await claimRewards();
    }
  };

  return (
    <Widget title="Claim Rewards">
      <RewardsClaimInfo />
      <RewardsClaimAmount amount={claimableRewards} />
      <RewardsClaimCTA account={account} />
    </Widget>
  );
};

import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { fetchPendingRewards } from 'services/web3/protection/rewards';
import { useInterval } from 'hooks/useInterval';
import { useAppSelector } from 'redux/index';
import { Pool, Token } from 'services/observables/tokens';
import { getTokenById } from 'redux/bancor/bancor';
import { getProtectedPools } from 'redux/bancor/pool';

import BigNumber from 'bignumber.js';
import { useQuery } from 'hooks/useQuery';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { getPositionById } from 'redux/liquidity/liquidity';
import { useNavigation } from 'services/router';

interface Props {
  pool?: Pool;
}

export const useRewardsClaim = ({ pool }: Props) => {
  const [claimableRewards, setClaimableRewards] = useState<string | null>(null);
  const [errorBalance, setErrorBalance] = useState('');
  const [bntAmount, setBntAmount] = useState('');
  const [bntAmountUsd, setBntAmountUsd] = useState('');
  const pools = useAppSelector<Pool[]>(getProtectedPools);
  const { pushRewardsStakeByID, pushRewardsStakeByIDnPos } = useNavigation();
  const query = useQuery();
  const posGroupId = query.get('posGroupId');

  const bnt = useAppSelector<Token | undefined>(
    getTokenById(pool ? pool.reserves[1].address : '')
  );

  const position = useAppSelector<ProtectedPositionGrouped | undefined>(
    getPositionById(posGroupId ?? '')
  );

  const { account } = useWeb3React();

  const fetchClaimableRewards = async (account: string) => {
    if (posGroupId && position) {
      setClaimableRewards(position.rewardsAmount);
    } else {
      const pendingRewards = await fetchPendingRewards(account);
      setClaimableRewards(pendingRewards);
    }
  };

  const onSelect = (pool: Pool) => {
    if (posGroupId) pushRewardsStakeByIDnPos(pool.pool_dlt_id, posGroupId);
    else pushRewardsStakeByID(pool.pool_dlt_id);
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

  useEffect(() => {
    if (new BigNumber(claimableRewards ?? 0).lt(bntAmount)) {
      setErrorBalance('Insufficient Balance');
    } else {
      setErrorBalance('');
    }
  }, [bntAmount, claimableRewards]);

  return {
    claimableRewards,
    account,
    bntAmount,
    setBntAmount,
    bntAmountUsd,
    setBntAmountUsd,
    bnt,
    errorBalance,
    pools,
    onSelect,
    position,
  };
};

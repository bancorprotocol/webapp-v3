import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { fetchPendingRewards } from 'services/web3/protection/rewards';
import { useInterval } from 'hooks/useInterval';
import { useAppSelector } from 'redux/index';
import { Pool, Token } from 'services/observables/tokens';
import { getTokenById } from 'redux/bancor/bancor';
import { getProtectedPools } from 'redux/bancor/pool';
import { useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';

interface Props {
  pool?: Pool;
}

export const useRewardsClaim = ({ pool }: Props) => {
  const [claimableRewards, setClaimableRewards] = useState<string | null>(null);
  const [errorBalance, setErrorBalance] = useState('');
  const [bntAmount, setBntAmount] = useState('');
  const [bntAmountUsd, setBntAmountUsd] = useState('');
  const pools = useAppSelector<Pool[]>(getProtectedPools);
  const history = useHistory();

  const bnt = useAppSelector<Token | undefined>(
    getTokenById(pool ? pool.reserves[1].address : '')
  );

  const { account } = useWeb3React();

  const fetchClaimableRewards = async (account: string) => {
    const pendingRewards = await fetchPendingRewards(account);
    setClaimableRewards(pendingRewards);
  };

  const onSelect = (pool: Pool) => {
    history.push(`/portfolio/rewards/stake/${pool.pool_dlt_id}`);
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
  };
};

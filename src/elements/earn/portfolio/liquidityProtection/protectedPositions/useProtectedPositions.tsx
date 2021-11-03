import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';
import {
  fetchProtectedPositions,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { useDispatch } from 'react-redux';
import { getGroupedPositions, setPositions } from 'redux/bancor/position';
import { useState } from 'react';

export const useProtectedPositions = () => {
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);
  const groupedPositions =
    useAppSelector<ProtectedPositionGrouped[]>(getGroupedPositions);
  const { account } = useWeb3React();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');

  useAsyncEffect(async () => {
    if (account && pools.length) {
      const positions = await fetchProtectedPositions(pools, account);
      dispatch(setPositions(positions));
    }
  }, [account, pools.length]);

  return { groupedPositions, search, setSearch };
};

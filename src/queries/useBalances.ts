import { useQuery } from 'react-query';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { useAppSelector } from 'store/index';
import { useV3ChainData } from 'queries/useV3ChainData';
import { ethToken } from 'services/web3/config';

export const useBalances = () => {
  const user = useAppSelector((state) => state.user.account);
  const { data: pools } = useV3ChainData();
  const tknIds: string[] = [];
  const bnTknIds: string[] = [];

  !!pools &&
    pools.forEach((p) => {
      tknIds.push(p.poolDltId);
      bnTknIds.push(p.poolTokenDltId);
    });

  return useQuery<Map<string, string> | undefined>(
    ['chain', 'v3', 'balances', user],
    () =>
      fetchTokenBalanceMulticall(
        [...tknIds, ...bnTknIds].filter((id) => id !== ethToken),
        user!
      ),
    { enabled: !!user && !!pools, useErrorBoundary: true }
  );
};

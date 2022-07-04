import { useQuery } from 'react-query';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { useApiPoolsV3 } from 'queries/useApiPoolsV3';
import { useWeb3React } from '@web3-react/core';

export const useTokens = () => {
  const { account } = useWeb3React();
  const { data: pools } = useApiPoolsV3();
  const ids = pools ? pools.map((p) => p.poolDltId) : [];

  return useQuery<Map<string, string>>(
    ['v3', 'tokens'],
    () => fetchTokenBalanceMulticall(ids, account!),
    { enabled: !!account && !!pools }
  );
};

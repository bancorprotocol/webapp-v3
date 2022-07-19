import { useQuery } from 'react-query';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { useApiPoolsV3 } from 'queries/useApiPoolsV3';
import { useAppSelector } from 'store';

export const useTokens = () => {
  const account = useAppSelector((state) => state.user.account);
  const { data: pools } = useApiPoolsV3();
  const ids = pools ? pools.map((p) => p.poolDltId) : [];

  return useQuery<Map<string, string>>(
    ['v3', 'tokens'],
    () => fetchTokenBalanceMulticall(ids, account!),
    { enabled: !!account && !!pools }
  );
};

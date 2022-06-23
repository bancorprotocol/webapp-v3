import { useQuery } from 'react-query';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';

export const useBalances = (tokenIds: string[], user?: string) => {
  return useQuery<Map<string, string>>(
    ['v3', 'token', 'balances'],
    () => fetchTokenBalanceMulticall(tokenIds, user!),
    { enabled: !!user }
  );
};

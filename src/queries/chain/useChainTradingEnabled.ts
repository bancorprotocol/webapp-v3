import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTime2m } from 'queries/queryOptions';
import {
  buildMulticallTradingEnabled,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

interface Props {
  enabled?: boolean;
}

export const useChainTradingEnabled = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainTradingEnabled(poolIds?.length),
    () => fetchMulticallHelper<boolean>(poolIds!, buildMulticallTradingEnabled),
    {
      ...queryOptionsStaleTime2m(!!poolIds && enabled),
      useErrorBoundary: true,
    }
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

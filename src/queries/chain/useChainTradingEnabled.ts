import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
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
    QueryKey.chainCoreTradingEnabled(poolIds?.length),
    () => fetchMulticallHelper<boolean>(poolIds!, buildMulticallTradingEnabled),
    queryOptionsStaleTimeLow(!!poolIds && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import {
  buildMulticallTradingEnabled,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainTradingEnabled = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreTradingEnabled(poolIds?.length),
    () => fetchMulticallHelper<boolean>(poolIds!, buildMulticallTradingEnabled),
    queryOptionsStaleTimeLow(!!poolIds)
  );
};

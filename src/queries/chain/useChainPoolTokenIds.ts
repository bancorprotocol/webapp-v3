import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallPoolToken,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainPoolTokenIds = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCorePoolTokenIds(poolIds?.length),
    () => fetchMulticallHelper<string>(poolIds!, buildMulticallPoolToken),
    queryOptionsNoInterval(!!poolIds)
  );
};

import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallName,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainTokenName = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreName(poolIds?.length),
    () => fetchMulticallHelper<string>(poolIds!, buildMulticallName, true),
    queryOptionsNoInterval(!!poolIds)
  );
};

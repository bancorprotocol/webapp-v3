import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import {
  buildMulticallDecimal,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { queryOptionsNoInterval } from 'queries/queryOptions';

export const useChainTokenDecimals = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreDecimals(poolIds?.length),
    () => fetchMulticallHelper<number>(poolIds!, buildMulticallDecimal),
    queryOptionsNoInterval(!!poolIds)
  );
};

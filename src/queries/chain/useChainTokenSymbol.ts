import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallSymbol,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainTokenSymbol = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreSymbols(poolIds?.length),
    () => fetchMulticallHelper<string>(poolIds!, buildMulticallSymbol, true),
    queryOptionsNoInterval(!!poolIds)
  );
};

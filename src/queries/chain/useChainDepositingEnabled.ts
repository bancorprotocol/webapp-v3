import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallDepositingEnabled,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainDepositingEnabled = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreDepositingEnabled(poolIds?.length),
    () =>
      fetchMulticallHelper<boolean>(poolIds!, buildMulticallDepositingEnabled),
    queryOptionsNoInterval(!!poolIds)
  );
};

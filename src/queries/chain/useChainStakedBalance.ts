import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import {
  buildMulticallStakedBalance,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { BigNumberish } from 'ethers';

export const useChainStakedBalance = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreStakedBalance(poolIds?.length),
    () =>
      fetchMulticallHelper<BigNumberish>(poolIds!, buildMulticallStakedBalance),
    queryOptionsStaleTimeLow(!!poolIds)
  );
};

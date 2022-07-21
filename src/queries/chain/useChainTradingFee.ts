import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import {
  buildMulticallTradingFee,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainTradingFee = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreTradingFee(poolIds?.length),
    () => fetchMulticallHelper<number>(poolIds!, buildMulticallTradingFee),
    {
      ...queryOptionsStaleTimeLow(!!poolIds),
    }
  );
};

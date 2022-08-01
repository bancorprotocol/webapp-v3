import { useQuery } from '@tanstack/react-query';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { QueryKey } from 'queries/queryKeyFactory';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import { bntToken } from 'services/web3/config';

export const useChainPoolIds = () => {
  return useQuery(
    QueryKey.chainPoolIds(),
    async () => {
      const pools = await ContractsApi.BancorNetwork.read.liquidityPools();
      return [bntToken, ...pools];
    },
    queryOptionsStaleTimeLow()
  );
};

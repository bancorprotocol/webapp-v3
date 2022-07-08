import { useQuery } from 'react-query';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { QueryKey } from 'queries/queryKeyFactory';
import { ethToken } from 'services/web3/config';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';

export const useChainPoolIds = () => {
  return useQuery(
    QueryKey.chainCorePoolIds(),
    async () => {
      const pools = await ContractsApi.BancorNetwork.read.liquidityPools();
      return pools.filter((id) => id !== ethToken);
    },
    queryOptionsStaleTimeLow()
  );
};

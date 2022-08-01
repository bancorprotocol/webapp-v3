import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallDepositingEnabled,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

interface Props {
  enabled?: boolean;
}

export const useChainDepositingEnabled = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();

  const query = useQuery(
    QueryKey.chainDepositingEnabled(poolIds?.length),
    () =>
      fetchMulticallHelper<boolean>(poolIds!, buildMulticallDepositingEnabled),
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallPoolToken,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

interface Props {
  enabled?: boolean;
}

export const useChainPoolTokenIds = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainPoolTokenIds(poolIds?.length),
    () => fetchMulticallHelper<string>(poolIds!, buildMulticallPoolToken),
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

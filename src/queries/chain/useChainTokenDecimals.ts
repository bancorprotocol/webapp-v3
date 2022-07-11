import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import {
  buildMulticallDecimal,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { queryOptionsNoInterval } from 'queries/queryOptions';

interface Props {
  enabled?: boolean;
}

export const useChainTokenDecimals = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainCoreDecimals(poolIds?.length),
    () => fetchMulticallHelper<number>(poolIds!, buildMulticallDecimal),
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getDecimalsByID = (id: string) => query.data?.get(id);

  return { ...query, getDecimalsByID };
};

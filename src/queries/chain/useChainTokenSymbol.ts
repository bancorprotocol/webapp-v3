import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallSymbol,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

interface Props {
  enabled?: boolean;
}

export const useChainTokenSymbol = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainCoreSymbols(poolIds?.length),
    () => fetchMulticallHelper<string>(poolIds!, buildMulticallSymbol, true),
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getSymbolByID = (id: string) => query.data?.get(id);

  return { ...query, getSymbolByID };
};

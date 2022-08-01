import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallSymbol,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { ethToken } from 'services/web3/config';

interface Props {
  enabled?: boolean;
}

export const useChainSymbol = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainSymbols(poolIds?.length),
    async () => {
      const symbols = await fetchMulticallHelper<string>(
        poolIds!,
        buildMulticallSymbol,
        true
      );
      symbols.set(ethToken, 'ETH');
      return symbols;
    },
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

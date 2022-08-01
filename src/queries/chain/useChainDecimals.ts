import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import {
  buildMulticallDecimal,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import { ethToken } from 'services/web3/config';

interface Props {
  enabled?: boolean;
}

export const useChainDecimals = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainDecimals(poolIds?.length),
    async () => {
      const decimals = await fetchMulticallHelper<number>(
        poolIds!.filter((id) => id !== ethToken),
        buildMulticallDecimal
      );
      decimals.set(ethToken, 18);
      return decimals;
    },
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

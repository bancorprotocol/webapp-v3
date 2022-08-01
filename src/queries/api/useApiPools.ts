import { useQuery } from '@tanstack/react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { QueryKey } from 'queries/queryKeyFactory';
import { queryOptionsStaleTime15s } from 'queries/queryOptions';

interface Props {
  enabled?: boolean;
}

export const useApiPools = ({ enabled = true }: Props = {}) => {
  const queryKey = QueryKey.apiPools();

  const query = useQuery(
    queryKey,
    async () => {
      try {
        const pools = await BancorApi.v3.getPoolsWithBNT();
        return new Map(pools.map((p) => [p.poolDltId, p]));
      } catch (e: any) {
        throw {
          ...e,
          message:
            'useQuery failed: ' + queryKey.join('-') + ' MSG: ' + e.message,
        };
      }
    },
    queryOptionsStaleTime15s(enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

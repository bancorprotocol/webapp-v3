import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { QueryKey } from 'queries/queryKeyFactory';

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
        throw new Error(
          'useQuery failed: ' + queryKey.join('-') + ' MSG: ' + e.message
        );
      }
    },
    {
      enabled,
      useErrorBoundary: true,
    }
  );

  const getApiPoolByID = (id: string) => query.data?.get(id);

  return { ...query, getApiPoolByID };
};

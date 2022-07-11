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
      const pools = await BancorApi.v3.getPools();
      return new Map(pools.map((p) => [p.poolDltId, p]));
    },
    {
      enabled,
      useErrorBoundary: true,
      onError: (err) => console.error('query failed', queryKey, err),
    }
  );

  const getApiPoolByID = (id: string) => query.data?.get(id);

  return { ...query, getApiPoolByID };
};

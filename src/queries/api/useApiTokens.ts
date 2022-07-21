import { useQuery } from '@tanstack/react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { QueryKey } from 'queries/queryKeyFactory';

interface Props {
  enabled?: boolean;
}

export const useApiTokens = ({ enabled = true }: Props = {}) => {
  const queryKey = QueryKey.apiTokens();

  const query = useQuery(
    queryKey,
    async () => {
      try {
        const pools = await BancorApi.v3.getTokens();
        return new Map(pools.map((t) => [t.dltId, t]));
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

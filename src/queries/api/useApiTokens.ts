import { useQuery } from '@tanstack/react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { QueryKey } from 'queries/queryKeyFactory';
import { queryOptionsStaleTime15s } from 'queries/queryOptions';

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
    queryOptionsStaleTime15s(enabled)
  );

  const getApiPoolByID = (id: string) => query.data?.get(id);

  return { ...query, getApiPoolByID };
};

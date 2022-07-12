import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { QueryKey } from 'queries/queryKeyFactory';

interface Props {
  enabled?: boolean;
}

export const useApiBnt = ({ enabled = true }: Props = {}) => {
  const queryKey = QueryKey.apiBnt();
  return useQuery(queryKey, BancorApi.v3.getBnt, {
    enabled,
    useErrorBoundary: true,
    onError: (err) => console.error('query failed', queryKey, err),
  });
};

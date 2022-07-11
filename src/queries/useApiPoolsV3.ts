import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';
import { QueryKey } from 'queries/queryKeyFactory';

interface Props {
  enabled?: boolean;
}

export const useApiPoolsV3 = ({ enabled = true }: Props = {}) => {
  const queryKey = QueryKey.apiPools();
  return useQuery<APIPoolV3[], Error>(queryKey, BancorApi.v3.getPools, {
    enabled,
    useErrorBoundary: true,
    onError: (err) => console.error('query failed', queryKey, err),
  });
};

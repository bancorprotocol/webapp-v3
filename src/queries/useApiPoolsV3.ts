import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';

export const useApiPoolsV3 = () => {
  const queryKey = ['api', 'v3', 'pools'];
  return useQuery<APIPoolV3[], Error>(queryKey, BancorApi.v3.getPools, {
    useErrorBoundary: true,
    onError: (err) => console.error('query failed', queryKey, err),
  });
};

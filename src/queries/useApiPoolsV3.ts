import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';

export const useApiPoolsV3 = () => {
  return useQuery<APIPoolV3[], Error>(
    ['v3', 'api', 'pools'],
    BancorApi.v3.getPools
  );
};

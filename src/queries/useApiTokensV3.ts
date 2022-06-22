import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { APITokenV3 } from 'services/api/bancorApi/bancorApi.types';

export const useApiTokensV3 = () => {
  return useQuery<APITokenV3[], Error>(
    ['v3', 'api', 'tokens'],
    BancorApi.v3.getTokens
  );
};

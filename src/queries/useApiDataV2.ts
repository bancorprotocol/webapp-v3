import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { WelcomeData } from 'services/api/bancorApi/bancorApi.types';

export const useApiDataV2 = () => {
  return useQuery<WelcomeData>(
    ['api', 'v2', 'welcome'],
    BancorApi.v2.getWelcome
  );
};

import { useQuery } from '@tanstack/react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { WelcomeData } from 'services/api/bancorApi/bancorApi.types';
import { queryOptionsStaleTime15s } from 'queries/queryOptions';
import { QueryKey } from 'queries/queryKeyFactory';

export const useApiV2Welcome = () => {
  return useQuery<WelcomeData>(
    QueryKey.v2ApiWelcome(),
    BancorApi.v2.getWelcome,
    queryOptionsStaleTime15s()
  );
};

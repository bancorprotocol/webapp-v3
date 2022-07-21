import { useQuery } from '@tanstack/react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { QueryKey } from 'queries/queryKeyFactory';
import { queryOptionsStaleTimeHigh } from 'queries/queryOptions';

interface Props {
  enabled?: boolean;
}

export const useApiBnt = ({ enabled = true }: Props = {}) => {
  const queryKey = QueryKey.apiBnt();
  return useQuery(
    queryKey,
    BancorApi.v3.getBnt,
    queryOptionsStaleTimeHigh(enabled)
  );
};

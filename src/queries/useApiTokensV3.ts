import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { APITokenV3 } from 'services/api/bancorApi/bancorApi.types';
import { useDispatch } from 'react-redux';
import { genericFailedNotification } from 'services/notifications/notifications';

export const useApiTokensV3 = () => {
  const dispatch = useDispatch();

  return useQuery<APITokenV3[], Error>(
    ['api', 'v3', 'tokens'],
    BancorApi.v3.getTokens,
    {
      useErrorBoundary: false,
      onError: (err) => {
        genericFailedNotification(
          dispatch,
          `${err.message}`,
          `Server Error: ${['api', 'v3', 'tokens'].join('->')}`
        );
      },
    }
  );
};

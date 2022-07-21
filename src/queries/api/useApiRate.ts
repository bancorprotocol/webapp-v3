import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiTokens } from 'queries/api/useApiTokens';

interface Props {
  enabled?: boolean;
}

export const useApiRate = ({ enabled = true }: Props = {}) => {
  const poolIds = useChainPoolIds();
  const apiTokens = useApiTokens({ enabled });

  const data = new Map(
    poolIds.data?.map((id) => {
      const apiToken = apiTokens.getApiPoolByID(id);

      if (!apiToken) {
        return [id, undefined];
      }
      return [id, apiToken.rate];
    })
  );

  const getByID = (id: string) => data.get(id);

  return {
    data,
    getByID,
    isLoading: apiTokens.isLoading || poolIds.isLoading,
    isFetching: apiTokens.isFetching || poolIds.isFetching,
    isError: apiTokens.isError || poolIds.isError,
  };
};

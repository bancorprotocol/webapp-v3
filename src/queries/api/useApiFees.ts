import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiPools } from 'queries/api/useApiPools';

interface Props {
  enabled?: boolean;
}

export const useApiFees = ({ enabled = true }: Props = {}) => {
  const poolIds = useChainPoolIds();
  const apiPools = useApiPools({ enabled });

  const data = new Map(
    poolIds.data?.map((id) => {
      const apiPool = apiPools.getByID(id);

      if (!apiPool) {
        return [id, undefined];
      }
      return [id, { fees7d: apiPool.fees7d, fees24h: apiPool.fees24h }];
    })
  );

  const getByID = (id: string) => data.get(id);

  return {
    data,
    getByID,
    isLoading: apiPools.isLoading || poolIds.isLoading,
    isFetching: apiPools.isFetching || poolIds.isFetching,
    isError: apiPools.isError || poolIds.isError,
  };
};

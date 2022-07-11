import { useMemo } from 'react';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiPools } from 'queries/api/useApiPools';

interface Props {
  enabled?: boolean;
}

export const useApiFees = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const { getApiPoolByID } = useApiPools({ enabled });

  const data = useMemo(
    () =>
      new Map(
        poolIds?.map((id) => {
          const apiPool = getApiPoolByID(id);

          if (!apiPool) {
            return [id, undefined];
          }
          return [id, { fees7d: apiPool.fees7d, fees24h: apiPool.fees24h }];
        })
      ),
    [getApiPoolByID, poolIds]
  );

  const getFeeByID = (id: string) => data.get(id);

  return { data, getFeeByID };
};

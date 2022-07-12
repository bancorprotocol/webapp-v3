import { useMemo } from 'react';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiPools } from 'queries/api/useApiPools';

interface Props {
  enabled?: boolean;
}

export const useApiVolume = ({ enabled = true }: Props = {}) => {
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
          return [
            id,
            { volume7d: apiPool.volume7d, volume24h: apiPool.volume24h },
          ];
        })
      ),
    [getApiPoolByID, poolIds]
  );

  const getVolumeByID = (id: string) => data.get(id);

  return { data, getVolumeByID };
};

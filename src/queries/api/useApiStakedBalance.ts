import { useMemo } from 'react';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiPools } from 'queries/api/useApiPools';

interface Props {
  enabled?: boolean;
}

export const useApiStakedBalance = ({ enabled = true }: Props = {}) => {
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
          return [id, { ...apiPool.stakedBalance }];
        })
      ),
    [getApiPoolByID, poolIds]
  );

  const getStakedBalanceByID = (id: string) => data.get(id);

  return { data, getStakedBalanceByID };
};

import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import {
  buildMulticallLatestProgramId,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { useChainPrograms } from 'queries/chain/useChainPrograms';
import { BigNumberish } from 'ethers';

interface Props {
  enabled?: boolean;
}

export const useChainLatestProgram = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const { data: programsMap } = useChainPrograms({ enabled });

  const query = useQuery(
    QueryKey.chainCoreLatestProgram(poolIds?.length),
    async () => {
      const ids = await fetchMulticallHelper<BigNumberish>(
        poolIds!,
        buildMulticallLatestProgramId
      );
      return new Map(
        poolIds?.map((id) => {
          const programs = programsMap
            ?.get(id)
            ?.find((p) => p.id === ids.get(id)?.toString());
          return [id, programs];
        })
      );
    },
    queryOptionsNoInterval(!!poolIds && !!programsMap && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

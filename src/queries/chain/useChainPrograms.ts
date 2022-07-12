import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsNoInterval } from 'queries/queryOptions';
import { fetchAllStandardRewards } from 'services/web3/v3/portfolio/standardStaking';

interface Props {
  enabled?: boolean;
}

export const useChainPrograms = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const query = useQuery(
    QueryKey.chainCorePrograms(poolIds?.length),
    async () => {
      const programs = await fetchAllStandardRewards();
      return new Map(
        poolIds?.map((id) => [id, programs.filter((p) => p.pool === id)])
      );
    },
    queryOptionsNoInterval(!!poolIds && enabled)
  );

  const getByID = (id: string) => query.data?.get(id);

  return { ...query, getByID };
};

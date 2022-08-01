import { useQuery } from '@tanstack/react-query';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { useAppSelector } from 'store/index';
import { ethToken } from 'services/web3/config';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useChainPoolTokenIds } from 'queries/chain/useChainPoolTokenIds';
import { useChainDecimals } from 'queries/chain/useChainDecimals';
import { shrinkToken } from 'utils/formulas';
import { QueryKey } from 'queries/queryKeyFactory';

interface Props {
  enabled?: boolean;
}

export const useChainBalances = ({ enabled = true }: Props = {}) => {
  const user = useAppSelector((state) => state.user.account);
  const poolIds = useChainPoolIds();
  const poolTokenIds = useChainPoolTokenIds({ enabled });
  const decimals = useChainDecimals({ enabled });

  const tknIds = poolIds.data ?? [];
  const bnTknIds = poolTokenIds.data
    ? Array.from(poolTokenIds.data.values())
    : [];

  const query = useQuery(
    QueryKey.chainBalances(user),
    () =>
      fetchTokenBalanceMulticall(
        [...tknIds, ...bnTknIds].filter((id) => id !== ethToken),
        user!
      ),
    {
      enabled:
        !!user &&
        !!poolIds.data &&
        !!poolTokenIds.data &&
        !!decimals.data &&
        enabled,
      useErrorBoundary: false,
    }
  );

  const getByID = (id: string) => {
    if (!user) return undefined;
    const poolTokenId = poolTokenIds.data?.get(id) ?? '';
    const dec = decimals.data?.get(id) ?? 0;
    return {
      tkn: shrinkToken(query.data?.get(id) ?? '0', dec),
      bnTkn: shrinkToken(query.data?.get(poolTokenId) ?? '0', dec),
    };
  };

  const queries = [poolIds, poolTokenIds, decimals, query];

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);

  return { ...query, getByID, isLoading, isFetching, isError };
};

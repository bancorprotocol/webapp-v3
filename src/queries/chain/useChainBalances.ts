import { useQuery } from '@tanstack/react-query';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { useAppSelector } from 'store/index';
import { ethToken } from 'services/web3/config';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useChainPoolTokenIds } from 'queries/chain/useChainPoolTokenIds';
import { useChainTokenDecimals } from 'queries/chain/useChainTokenDecimals';
import { shrinkToken } from 'utils/formulas';

interface Props {
  enabled?: boolean;
}

export const useChainBalances = ({ enabled = true }: Props = {}) => {
  const user = useAppSelector((state) => state.user.account);
  const { data: poolIds } = useChainPoolIds();
  const { data: poolTokenIds } = useChainPoolTokenIds({ enabled });
  const { data: decimals } = useChainTokenDecimals({ enabled });

  const tknIds = poolIds ?? [];
  const bnTknIds = poolTokenIds ? Array.from(poolTokenIds.values()) : [];

  const query = useQuery(
    ['chain', 'balances', user],
    () =>
      fetchTokenBalanceMulticall(
        [...tknIds, ...bnTknIds].filter((id) => id !== ethToken),
        user!
      ),
    {
      enabled: !!user && !!poolIds && !!poolTokenIds && !!decimals && enabled,
      useErrorBoundary: false,
    }
  );

  const getByID = (id: string) => {
    if (!user) return undefined;
    const poolTokenId = poolTokenIds?.get(id) ?? '';
    const dec = decimals?.get(id) ?? 0;
    return {
      tkn: shrinkToken(query.data?.get(id) ?? '0', dec),
      bnTkn: shrinkToken(query.data?.get(poolTokenId) ?? '0', dec),
    };
  };

  return { ...query, getByID, isLoading: query.isLoading && query.isFetching };
};

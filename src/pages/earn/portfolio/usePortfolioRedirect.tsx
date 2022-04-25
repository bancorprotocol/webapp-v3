import { useExternalHoldings } from 'elements/earn/portfolio/v3/externalHoldings/useExternalHoldings';
import { getAvailableToStakeTokens } from 'redux/bancor/token';
import { useAppSelector } from 'redux/index';
import { PoolToken } from 'services/observables/pools';
import { ProtectedPosition } from 'services/web3/protection/positions';

export const useWelcomeRedirect = () => {
  const account = useAppSelector((state) => state.user.account);
  const v2 = useAppSelector<ProtectedPosition[]>(
    (state) => state.liquidity.protectedPositions
  );
  const v1 = useAppSelector<PoolToken[]>((state) => state.liquidity.poolTokens);

  const walletEmpty = useWalletEmpty();

  return !account || !v1.length || !v2.length || !walletEmpty;
};

export const useWalletEmpty = () => {
  const { positions } = useExternalHoldings();
  const account = useAppSelector((state) => state.user.account);
  const availabelToStake = useAppSelector(getAvailableToStakeTokens);

  return !account || (!positions.length && !availabelToStake);
};

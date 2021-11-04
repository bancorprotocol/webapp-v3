import { MyStake } from './protectedPositions/MyStake';
import { MyRewards } from './rewards/MyRewards';
import { ProtectedPositionsTable } from './protectedPositions/ProtectedPositionsTable';
import { ClaimAvailable } from './claim/ClaimAvailable';
import { ClaimLocked } from './claim/ClaimLocked';
import { useWeb3React } from '@web3-react/core';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { Token } from 'services/observables/tokens';
import { bntToken } from 'services/web3/config';
import { LockedBnt } from 'services/web3/lockedbnt/lockedbnt';
import { EthNetworks } from 'services/web3/types';

export const LiquidityProtection = () => {
  const { chainId } = useWeb3React();
  const bnt = useAppSelector<Token | undefined>(
    getTokenById(bntToken(chainId ?? EthNetworks.Mainnet))
  );
  const availableBNT = useAppSelector<number>(
    (state) => state.liquidity.availableBNT
  );
  const lockedBNT = useAppSelector<LockedBnt[]>(
    (state) => state.liquidity.lockedBNT
  );

  return (
    <div className="space-y-30">
      <p>
        Manage your protected positions in Bancor pools and track and analyze
        your returns.
      </p>

      <div className="grid xl:grid-cols-2 gap-40">
        <MyStake />
        <MyRewards />
      </div>

      <ProtectedPositionsTable />

      <h2>Closed Positions</h2>
      <p>
        When unstaking protected positions, you will be able to see and claim
        your BNT here
      </p>
      <div className="grid xl:grid-cols-2 gap-40">
        <ClaimAvailable bnt={bnt} availableBNT={availableBNT} />
        <ClaimLocked bnt={bnt} lockedBNT={lockedBNT} />
      </div>
    </div>
  );
};

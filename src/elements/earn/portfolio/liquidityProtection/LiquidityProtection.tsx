import { MyStake } from './protectedPositions/MyStake';
import { MyRewards } from './rewards/MyRewards';
import { ProtectedPositionsTable } from './protectedPositions/ProtectedPositionsTable';
import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { bntToken } from 'services/web3/config';
import { LockedAvailableBnt } from 'services/web3/lockedbnt/lockedbnt';
import { getTokenV2ById } from 'store/bancor/bancor';
import { ClaimAvailable } from './claim/ClaimAvailable';
import { ClaimLocked } from './claim/ClaimLocked';

export const LiquidityProtection = () => {
  const bnt = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, bntToken)
  );
  const lockedAvailableBNT = useAppSelector<LockedAvailableBnt>(
    (state) => state.liquidity.lockedAvailableBNT
  );
  const loadingLockedBnt = useAppSelector<boolean>(
    (state) => state.liquidity.loadingLockedBnt
  );

  const loadingPositions = useAppSelector<boolean>(
    (state) => state.liquidity.loadingPositions
  );

  return (
    <div className="space-y-30">
      <div className="grid xl:grid-cols-2 gap-40">
        <MyStake loading={loadingPositions} />
        <MyRewards />
      </div>

      <ProtectedPositionsTable loading={loadingPositions} />

      <h2 className="pl-10 md:pl-0">Closed Positions</h2>
      <p className="pl-10 md:pl-0">
        When unstaking protected positions, you will be able to see and claim
        your BNT here
      </p>
      <div className="grid xl:grid-cols-2 gap-40">
        <ClaimAvailable
          bnt={bnt}
          availableBNT={lockedAvailableBNT.available}
          loading={loadingLockedBnt}
        />
        <ClaimLocked
          bnt={bnt}
          lockedBNT={lockedAvailableBNT.locked}
          loading={loadingLockedBnt}
        />
      </div>
    </div>
  );
};

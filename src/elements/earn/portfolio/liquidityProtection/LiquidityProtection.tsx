import { MyStake } from './protectedPositions/MyStake';
import { MyRewards } from './rewards/MyRewards';
import { ProtectedPositionsTable } from './protectedPositions/ProtectedPositionsTable';
import { ClaimAvailable } from './claim/ClaimAvailable';
import { ClaimLocked } from './claim/ClaimLocked';

export const LiquidityProtection = () => {
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
        <ClaimAvailable />
        <ClaimLocked />
      </div>
    </div>
  );
};

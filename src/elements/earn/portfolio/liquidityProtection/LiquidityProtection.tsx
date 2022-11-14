import { MyStake } from './protectedPositions/MyStake';
import { MyRewards } from './rewards/MyRewards';
import { ProtectedPositionsTable } from './protectedPositions/ProtectedPositionsTable';
import { useAppSelector } from 'store';

export const LiquidityProtection = () => {
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
    </div>
  );
};

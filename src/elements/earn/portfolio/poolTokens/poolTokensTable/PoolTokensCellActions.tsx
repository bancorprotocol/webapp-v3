import { PoolToken } from 'services/observables/pools';
import { Button } from 'components/button/Button';
import { migrateV1Positions } from 'services/web3/protection/migration';

export const PoolTokensCellActions = (poolToken: PoolToken) => {
  return (
    <Button
      onClick={() => migrateV1Positions(poolToken)}
      className="w-[140px] h-[35px]"
    >
      Upgrade To V3
    </Button>
  );
};

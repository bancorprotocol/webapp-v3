import { Image } from 'components/image/Image';
import { Pool } from 'services/observables/pools';

export const PoolsTableCellName = (pool: Pool) => {
  return (
    <div className="flex items-center">
      <Image
        src={pool.reserves[0].logoURI.replace('thumb', 'small')}
        alt="Token Logo"
        className="bg-fog rounded-full w-40 h-40"
      />
      <h3 className="text-14 ml-32">{pool.isProtected ? pool.name.replace('/BNT', '') : pool.name}</h3>
    </div>
  );
};

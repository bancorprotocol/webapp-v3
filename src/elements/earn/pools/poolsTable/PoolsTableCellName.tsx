import { Image } from 'components/image/Image';
import { Pool } from 'services/observables/pools';

export const PoolsTableCellName = (pool: Pool) => {
  return (
    <div className="flex items-center">
      <Image
        src={pool.reserves[0].logoURI.replace('thumb', 'small')}
        alt="Token Logo"
        className="bg-fog rounded-full w-30 h-30 z-20"
      />
      <Image
        src={pool.reserves[1].logoURI.replace('thumb', 'small')}
        alt="Token Logo"
        className="-ml-12 bg-fog rounded-full w-30 h-30 z-10"
      />

      <h3 className="text-14 ml-10">{pool.name}</h3>
    </div>
  );
};

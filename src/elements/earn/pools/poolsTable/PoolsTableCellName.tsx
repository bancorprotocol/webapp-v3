import { Pool } from 'services/observables/pools';
import { TokenImage } from 'components/image/TokenImage';

export const PoolsTableCellName = (pool: Pool) => {
  return (
    <div className="flex items-center">
      <TokenImage
        src={pool.reserves[0].logoURI.replace('thumb', 'small')}
        alt="Token Logo"
        className="!rounded-full w-40 h-40"
      />
      <h3 className="text-14 ml-32">
        {pool.isProtected ? pool.name.replace('/BNT', '') : pool.name}
      </h3>
    </div>
  );
};

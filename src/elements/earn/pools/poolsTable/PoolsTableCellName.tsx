import { Pool } from 'services/observables/tokens';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { Image } from 'components/image/Image';

export const PoolsTableCellName = (pool: Pool) => {
  return (
    <div className={'flex items-center'}>
      <div className="w-18">
        {pool.isProtected && (
          <IconProtected className={`w-18 h-20 text-primary`} />
        )}
      </div>
      <div className="flex ml-20">
        <Image
          src={pool.reserves[0].logoURI.replace('thumb', 'small')}
          alt="Token Logo"
          className="bg-grey-1 rounded-full w-30 h-30 z-20"
        />
        <Image
          src={pool.reserves[1].logoURI.replace('thumb', 'small')}
          alt="Token Logo"
          className="-ml-12 bg-grey-1 rounded-full w-30 h-30 z-10"
        />
      </div>
      <h3 className="text-14 ml-10">{pool.name}</h3>
    </div>
  );
};

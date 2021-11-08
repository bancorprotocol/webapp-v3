import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { Image } from 'components/image/Image';

export const ProtectedPositionTableCellLiquidity = (
  position: ProtectedPositionGrouped
) => {
  const isGroup = position.groupId && position.groupId.includes('-');
  return (
    <div className={!isGroup ? 'border-l-2 border-primary pl-10' : ''}>
      <div className="flex items-center">
        <Image
          src={position.reserveToken.logoURI}
          alt="Token Logo"
          className="rounded-full w-24 h-24 mr-10"
        />
        <div className="font-medium">{position.reserveToken.symbol}</div>
      </div>
      <div className="ml-[34px] text-12 text-grey-4 mt-4">
        {position.pool.name}
      </div>
    </div>
  );
};

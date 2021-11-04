import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { prettifyNumber } from 'utils/helperFunctions';

export const ProtectedPositionTableCellFees = (
  position: ProtectedPositionGrouped
) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center font-medium h-24">
        {prettifyNumber(position.fees)} {position.reserveToken.symbol}
      </div>
      <div className="text-12 text-primary mt-4 bg-blue-0 rounded-10 px-5 py-2">
        ???? | X{Number(position.rewardsMultiplier).toFixed(2)}
      </div>
    </div>
  );
};

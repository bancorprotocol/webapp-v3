import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';

export const ProtectedPositionTableCellFees = (
  position: ProtectedPositionGrouped
) => {
  const hasRewards = new BigNumber(position.rewardsAmount).isGreaterThan(0);
  const isSubRow = !position.groupId;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center font-medium h-24">
        {prettifyNumber(position.fees)} {position.reserveToken.symbol}
      </div>
      {hasRewards && !isSubRow && (
        <div className="flex justify-center">
          <div className="text-12 text-primary mt-4 bg-blue-0 rounded-10 px-5 py-2">
            + {prettifyNumber(position.rewardsAmount)} BNT | X
            {Number(position.rewardsMultiplier).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

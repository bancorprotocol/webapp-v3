import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { prettifyNumber } from 'utils/helperFunctions';

export const ProtectedPositionTableCellFees = (
  position: ProtectedPositionGrouped
) => {
  // const hasRewards = new BigNumber(position.rewardsAmount).isGreaterThan(0);
  const hasRewards = false;
  const isSubRow = !position.groupId;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center h-24 font-medium">
        {prettifyNumber(position.fees)} {position.reserveToken.symbol}
      </div>
      {hasRewards && !isSubRow && (
        <div className="flex justify-center">
          <div className="px-5 py-2 mt-4 text-12 text-primary bg-primary-light dark:bg-primary-dark dark:bg-opacity-20 rounded-10">
            + {prettifyNumber(position.rewardsAmount)} BNT | X
            {Number(position.rewardsMultiplier).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

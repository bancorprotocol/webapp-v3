import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import BigNumber from 'bignumber.js';

export const ProtectedPositionTableCellRoi = (
  position: ProtectedPositionGrouped
) => {
  const hasRewards = new BigNumber(position.rewardsAmount).isGreaterThan(0);
  const isSubRow = !position.groupId;
  const fees = Number(position.roi.fees);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center font-medium h-24">
        {fees > 0 ? (fees * 100).toFixed(2) : '0.00'} %
      </div>
      {hasRewards && !isSubRow && (
        <div className="flex justify-center">
          <div className="text-12 text-primary mt-4 bg-blue-0 rounded-10 px-5 py-2">
            + {(Number(position.roi.reserveRewards) * 100).toFixed(2)} %
          </div>
        </div>
      )}
    </div>
  );
};

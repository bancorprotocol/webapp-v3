import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { Row } from 'react-table';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconClock } from 'assets/icons/clock.svg';
import BigNumber from 'bignumber.js';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const ProtectedPositionTableCellClaimable = (
  row: Row<ProtectedPositionGrouped>
) => {
  const { tknAmount, usdAmount } = row.original.claimableAmount;
  const { symbol } = row.original.reserveToken;
  const currentCoveragePercent = new BigNumber(
    row.original.currentCoveragePercent
  )
    .times(100)
    .toFixed(0);
  return (
    <div className="text-center">
      <div className="flex items-center justify-center font-medium h-24">
        {!row.canExpand && (
          <PopoverV3
            buttonElement={() => <IconClock className="w-18 h-20 mr-6" />}
          >
            Current protection is {currentCoveragePercent}%
          </PopoverV3>
        )}
        {`${prettifyNumber(tknAmount)} ${symbol}`}
      </div>
      <div className="text-12 text-black-low dark:text-white-low mt-4">
        {prettifyNumber(usdAmount, true)} USD
      </div>
    </div>
  );
};

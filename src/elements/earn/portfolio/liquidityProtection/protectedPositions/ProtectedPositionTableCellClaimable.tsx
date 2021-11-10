import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { Row } from 'react-table';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconClock } from 'assets/icons/clock.svg';
import { Tooltip } from 'components/tooltip/Tooltip';
import BigNumber from 'bignumber.js';

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
          <Tooltip
            content={`Current protection is ${currentCoveragePercent}%`}
            button={<IconClock className="w-14 mr-6" />}
          />
        )}
        {`${prettifyNumber(tknAmount)} ${symbol}`}
      </div>
      <div className="text-12 text-grey-4 mt-4">
        {prettifyNumber(usdAmount, true)} USD
      </div>
    </div>
  );
};

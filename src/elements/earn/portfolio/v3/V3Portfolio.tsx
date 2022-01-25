import { V3Withdraw } from 'elements/earn/portfolio/v3/V3Withdraw';
import { V3ExternalHoldings } from 'elements/earn/portfolio/v3/V3ExternalHoldings';
import { V3TotalHoldings } from 'elements/earn/portfolio/v3/V3TotalHoldings';
import { V3HoldingsStats } from 'elements/earn/portfolio/v3/V3HoldingsStats';
import { V3EarningTable } from 'elements/earn/portfolio/v3/V3EarningTable';
import { V3AvailableToStake } from 'elements/earn/portfolio/v3/V3AvailableToStake';

export const V3Portfolio = () => {
  return (
    <div>
      <div className="grid grid-cols-12 gap-x-[36px]">
        <div className="col-span-8 space-y-20">
          <V3TotalHoldings />
          <V3HoldingsStats />
          <V3EarningTable />
          <V3AvailableToStake />
        </div>
        <div className="col-span-4 space-y-20">
          <V3Withdraw />
          <V3ExternalHoldings />
        </div>
      </div>
    </div>
  );
};

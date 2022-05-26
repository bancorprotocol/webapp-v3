import { Holding } from 'store/portfolio/v3Portfolio.types';
import { ReactComponent as IconLightning } from 'assets/icons/lightning.svg';
import { useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { PopoverV3 } from 'components/popover/PopoverV3';

interface Props {
  holding: Holding;
  percentageUnstaked: string;
}

export const V3WithdrawStep1Breakdown = ({
  holding,
  percentageUnstaked,
}: Props) => {
  const {
    pool: {
      reserveToken: { symbol },
    },
    latestProgram,
    tokenBalance,
  } = holding;

  const amount = useMemo(
    () =>
      shrinkToken(latestProgram?.tokenAmountWei || 0, holding.pool.decimals),
    [holding.pool.decimals, latestProgram?.tokenAmountWei]
  );

  const percentageStaked = useMemo(
    () => 100 - Number(percentageUnstaked),
    [percentageUnstaked]
  );

  return (
    <div className="text-right">
      <PopoverV3
        buttonElement={() => (
          <div className="text-primary flex items-center">
            <IconLightning className="w-8 mr-8" />
            {percentageUnstaked}% ready
          </div>
        )}
      >
        <>
          <div>{percentageUnstaked}% ready</div>
          <div>
            {prettifyNumber(tokenBalance)} {symbol}
          </div>
          <div>{percentageStaked}% Held for rewards</div>
          <div>
            {prettifyNumber(amount)} {symbol}
          </div>
        </>
      </PopoverV3>
    </div>
  );
};

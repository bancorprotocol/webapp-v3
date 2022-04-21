import { Holding } from 'redux/portfolio/v3Portfolio.types';
import { ReactComponent as IconLightning } from 'assets/icons/lightning.svg';
import { utils } from 'ethers';
import { Tooltip } from 'components/tooltip/Tooltip';
import { useMemo } from 'react';

interface Props {
  holding: Holding;
  percentageUnstaked: string;
}

export const V3WithdrawStep1Breakdown = ({
  holding,
  percentageUnstaked,
}: Props) => {
  const {
    token: { symbol },
    standardStakingReward,
    tokenBalance,
  } = holding;
  const amount = useMemo(
    () => utils.formatUnits(standardStakingReward?.tokenAmountWei || 0),
    [standardStakingReward?.tokenAmountWei]
  );
  const percentageStaked = useMemo(
    () => 100 - Number(percentageUnstaked),
    [percentageUnstaked]
  );

  return (
    <div className="text-right">
      <Tooltip
        placement={'bottom'}
        content={
          <>
            <div>{percentageUnstaked}% ready</div>
            <div>
              {tokenBalance} {symbol}
            </div>
            <div>{percentageStaked}% Held for rewards</div>
            <div>
              {amount} {symbol}
            </div>
          </>
        }
      >
        <div className="text-primary flex items-center">
          <IconLightning className="w-8 mr-8" />
          {percentageUnstaked}% ready
        </div>
      </Tooltip>
    </div>
  );
};

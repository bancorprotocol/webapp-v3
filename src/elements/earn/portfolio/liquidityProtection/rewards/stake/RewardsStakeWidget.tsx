import { Pool } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { SelectPool } from 'components/selectPool/SelectPool';
import { RewardsStakeCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeCTA';
import { RewardsStakeSpaceAvailable } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeSpaceAvailable';
import { useRewardsClaim } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/useRewardsClaim';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useNavigation } from 'services/router';

interface Props {
  pool: Pool;
}

export const RewardsStakeWidget = ({ pool }: Props) => {
  const {
    claimableRewards,
    account,
    bntAmount,
    setBntAmount,
    bntAmountUsd,
    setBntAmountUsd,
    bnt,
    errorBalance,
    pools,
    onSelect,
    position,
  } = useRewardsClaim({ pool });
  const { pushPortfolio } = useNavigation();

  return (
    <Widget title="Stake Rewards" goBack={pushPortfolio}>
      <div className="p-10">
        <SelectPool
          pool={pool}
          pools={pools}
          onSelect={onSelect}
          label="Stake in Pool"
        />
        <div className="mt-20">
          <TokenInputField
            input={bntAmount}
            setInput={setBntAmount}
            amountUsd={bntAmountUsd}
            label="Stake Amount"
            setAmountUsd={setBntAmountUsd}
            token={bnt ? { ...bnt, balance: claimableRewards } : undefined}
            selectable={false}
            border
          />
          {errorBalance && (
            <div className="mt-5 pl-[140px] text-error">{errorBalance}</div>
          )}
        </div>
        <RewardsStakeSpaceAvailable pool={pool} />
        <RewardsStakeCTA
          pool={pool}
          account={account}
          errorBalance={errorBalance}
          bntAmount={bntAmount}
          position={position}
        />
      </div>
    </Widget>
  );
};

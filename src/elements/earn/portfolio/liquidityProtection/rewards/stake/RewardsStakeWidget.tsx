import { Pool } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { SelectPool } from 'components/selectPool/SelectPool';
import { useAppSelector } from 'redux/index';
import { getPools } from 'redux/bancor/pool';
import { useHistory } from 'react-router-dom';
import { RewardsStakeCTA } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeCTA';
import { RewardsStakeSpaceAvailable } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeSpaceAvailable';
import { useRewardsClaim } from 'elements/earn/portfolio/liquidityProtection/rewards/claim/useRewardsClaim';
import { RewardsStakeAmount } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeAmount';

interface Props {
  pool: Pool;
}

export const RewardsStakeWidget = ({ pool }: Props) => {
  const [claimableRewards, account] = useRewardsClaim();
  const pools = useAppSelector<Pool[]>(getPools);
  const history = useHistory();

  const onSelect = (pool: Pool) => {
    history.push(`/portfolio/rewards/stake/${pool.pool_dlt_id}`);
  };

  return (
    <Widget title="Stake Rewards">
      <SelectPool pool={pool} pools={pools} onSelect={onSelect} />
      <RewardsStakeAmount pool={pool} claimableAmount={claimableRewards} />
      <RewardsStakeSpaceAvailable pool={pool} />
      <RewardsStakeCTA pool={pool} account={account} />
    </Widget>
  );
};

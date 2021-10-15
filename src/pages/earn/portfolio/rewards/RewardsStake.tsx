import { RouteComponentProps } from 'react-router-dom';
import { useAppSelector } from 'redux/index';
import { getPoolById, SelectedPool } from 'redux/bancor/pool';
import { WidgetLoading } from 'components/widgets/WidgetLoading';
import { RewardsStakeWidget } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeWidget';
import { WidgetError } from 'components/widgets/WidgetError';

export const RewardsStake = (props: RouteComponentProps<{ id: string }>) => {
  const { id } = props.match.params;
  const { status, pool } = useAppSelector<SelectedPool>(getPoolById(id));
  const title = 'Stake Rewards';
  return (
    <div>
      {status === 'loading' ? (
        <WidgetLoading title={title} />
      ) : (
        <div>
          {!pool ? (
            <WidgetError title={title} />
          ) : (
            <RewardsStakeWidget pool={pool} />
          )}
        </div>
      )}
    </div>
  );
};

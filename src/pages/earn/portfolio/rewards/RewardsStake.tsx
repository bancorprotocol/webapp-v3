import { RouteComponentProps } from 'react-router-dom';
import { useAppSelector } from 'store';
import { getPoolById, SelectedPool } from 'store/bancor/pool';
import { WidgetLoading } from 'components/widgets/WidgetLoading';
import { RewardsStakeWidget } from 'elements/earn/portfolio/liquidityProtection/rewards/stake/RewardsStakeWidget';
import { WidgetError } from 'components/widgets/WidgetError';

export const RewardsStake = (props: RouteComponentProps<{ id: string }>) => {
  const { id } = props.match.params;
  const { status, pool } = useAppSelector<SelectedPool>(getPoolById(id));
  const title = 'Stake Rewards';
  return (
    <div className="pt-40 md:pt-[100px]">
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

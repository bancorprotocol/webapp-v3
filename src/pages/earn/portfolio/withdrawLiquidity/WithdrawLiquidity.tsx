import { WidgetError } from 'components/widgets/WidgetError';
import { WidgetLoading } from 'components/widgets/WidgetLoading';
import { RouteComponentProps } from 'react-router-dom';
import { useAppSelector } from 'redux/index';
import { SelectedPool, getPoolById } from 'redux/bancor/pool';
import { WithdrawLiquidityWidget } from 'elements/earn/portfolio/withdrawLiquidity/WithdrawLiquidityWidget';

export const WithdrawLiquidity = (
  props: RouteComponentProps<{ id: string }>
) => {
  const { id } = props.match.params;
  const { status, pool } = useAppSelector<SelectedPool>(getPoolById(id));

  const title = 'Withdraw';

  return (
    <div>
      {status === 'loading' ? (
        <WidgetLoading title={title} />
      ) : (
        <div>
          {!pool ? (
            <WidgetError title={title} />
          ) : (
            <WithdrawLiquidityWidget pool={pool} />
          )}
        </div>
      )}
    </div>
  );
};

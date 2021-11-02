import { SelectPool } from 'components/selectPool/SelectPool';
import { Widget } from 'components/widgets/Widget';
import { WidgetError } from 'components/widgets/WidgetError';
import { WidgetLoading } from 'components/widgets/WidgetLoading';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useAppSelector } from 'redux/index';
import {
  SelectedPool,
  getPoolById,
  getProtectedPools,
} from 'redux/bancor/pool';
import { Pool, Token } from 'services/observables/tokens';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { getTokenById } from 'redux/bancor/bancor';

export const WithdrawLiquidity = (
  props: RouteComponentProps<{ id: string }>
) => {
  const { id } = props.match.params;
  const { status, pool } = useAppSelector<SelectedPool>(getPoolById(id));
  const pools = useAppSelector<Pool[]>(getProtectedPools);

  const token = useAppSelector<Token | undefined>(
    getTokenById(pool ? pool.reserves[0].address : '')
  );

  const title = 'Withdraw';
  const history = useHistory();

  const onSelect = (pool: Pool) => {
    history.push(`/portfolio/withdraw/${pool.pool_dlt_id}`);
  };

  return (
    <div>
      {status === 'loading' ? (
        <WidgetLoading title={title} />
      ) : (
        <div>
          {!pool ? (
            <WidgetError title={title} />
          ) : (
            <Widget title={title} goBackRoute="/portfolio">
              <div className="px-10 pb-10">
                <SelectPool
                  pool={pool}
                  pools={pools}
                  onSelect={onSelect}
                  label="Pool"
                />
                <div className="my-20">
                  <TokenInputPercentage label="Amount" token={token} />
                </div>
                <div className="flex justify-between items-center">
                  <div>Output amount</div>
                  <div>123 ETH</div>
                </div>
                <button
                  onClick={() => {}}
                  className={`btn-primary rounded w-full mt-30 mb-10`}
                >
                  Withdraw
                </button>
              </div>
            </Widget>
          )}
        </div>
      )}
    </div>
  );
};

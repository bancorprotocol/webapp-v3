import { getPoolById, SelectedPool } from 'redux/bancor/pool';
import { RouteComponentProps } from 'react-router-dom';
import { AddLiquiditySingle } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingle';
import { AddLiquidityDual } from 'elements/earn/pools/addLiquidity/dual/AddLiquidityDual';
import { AddLiquidityEmpty } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmpty';
import { AddLiquidityLoading } from 'elements/earn/pools/addLiquidity/AddLiquidityLoading';
import { AddLiquidityError } from 'elements/earn/pools/addLiquidity/AddLiquidityError';
import { useAppSelector } from 'redux/index';

export const AddLiquidity = (props: RouteComponentProps<{ id: string }>) => {
  const { id } = props.match.params;
  const { status, pool, type } = useAppSelector<SelectedPool>(getPoolById(id));

  return (
    <div>
      <div>
        {status === 'loading' ? (
          <AddLiquidityLoading />
        ) : (
          <div>
            {!pool ? (
              <AddLiquidityError />
            ) : (
              <div>
                {type === 'single' && <AddLiquiditySingle pool={pool} />}
                {type === 'dual' && <AddLiquidityDual pool={pool} />}
                {type === 'empty' && <AddLiquidityEmpty pool={pool} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

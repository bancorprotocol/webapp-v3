import { useAppSelector } from 'redux/index';
import { getPoolById } from 'redux/bancor/pool';
import { Pool } from 'services/observables/tokens';
import { RouteComponentProps } from 'react-router-dom';
import { AddLiquiditySingle } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingle';
import { AddLiquidityDual } from 'elements/earn/pools/addLiquidity/AddLiquidityDual';
import { AddLiquidityEmpty } from 'elements/earn/pools/addLiquidity/AddLiquidityEmpty';
import { AddLiquidityLoading } from 'elements/earn/pools/addLiquidity/AddLiquidityLoading';
import { AddLiquidityError } from 'elements/earn/pools/addLiquidity/AddLiquidityError';

interface SelectedPool {
  pool: Pool;
  type: 'empty' | 'single' | 'dual';
}

export const AddLiquidity = (props: RouteComponentProps<{ id: string }>) => {
  const { id } = props.match.params;
  const selectedPool = useAppSelector<SelectedPool | null | undefined>(
    getPoolById(id)
  );

  return (
    <div>
      {selectedPool && (
        <div>
          {selectedPool.type === 'single' && (
            <AddLiquiditySingle pool={selectedPool.pool} />
          )}
          {selectedPool.type === 'dual' && (
            <AddLiquidityDual pool={selectedPool.pool} />
          )}
          {selectedPool.type === 'empty' && (
            <AddLiquidityEmpty pool={selectedPool.pool} />
          )}
        </div>
      )}
      <div>{selectedPool === null && <AddLiquidityLoading />}</div>
      <div>{selectedPool === undefined && <AddLiquidityError />}</div>
    </div>
  );
};

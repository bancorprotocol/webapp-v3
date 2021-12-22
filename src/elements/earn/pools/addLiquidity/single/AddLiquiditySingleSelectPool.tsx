import { Pool } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { getPools } from 'redux/bancor/pool';
import { useHistory } from 'react-router-dom';
import { SelectPool } from 'components/selectPool/SelectPool';
import { addLiquidityByID, push } from 'utils/router';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingleSelectPool = ({ pool }: Props) => {
  const history = useHistory();
  const pools = useAppSelector<Pool[]>(getPools);

  const onSelect = (pool: Pool) => {
    push(addLiquidityByID(pool.pool_dlt_id), history);
  };

  return (
    <div className="my-20">
      <SelectPool
        pool={pool}
        pools={pools}
        onSelect={onSelect}
        label="Stake in Pool"
      />
    </div>
  );
};

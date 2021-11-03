import { Pool } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { getPools } from 'redux/bancor/pool';
import { useHistory } from 'react-router-dom';
import { SelectPool } from 'components/selectPool/SelectPool';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingleSelectPool = ({ pool }: Props) => {
  const history = useHistory();
  const pools = useAppSelector<Pool[]>(getPools);

  const onSelect = (pool: Pool) => {
    history.push(`/pools/add-liquidity/${pool.pool_dlt_id}`);
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

import { useAppSelector } from 'store';
import { getPools } from 'store/bancor/pool';
import { SelectPool } from 'components/selectPool/SelectPool';
import { useNavigation } from 'services/router';
import { Pool } from 'services/observables/pools';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingleSelectPool = ({ pool }: Props) => {
  const { pushAddLiquidityByID } = useNavigation();
  const pools = useAppSelector<Pool[]>(getPools);

  const onSelect = (pool: Pool) => {
    pushAddLiquidityByID(pool.pool_dlt_id);
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

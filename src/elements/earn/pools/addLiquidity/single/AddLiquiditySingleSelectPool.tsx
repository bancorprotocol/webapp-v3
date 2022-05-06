import { useAppSelector } from 'store';
import { getPools } from 'store/bancor/pool';
import { SelectPool } from 'components/selectPool/SelectPool';
import { Pool } from 'services/observables/pools';
import { useNavigation } from 'hooks/useNavigation';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingleSelectPool = ({ pool }: Props) => {
  const { goToPage } = useNavigation();
  const pools = useAppSelector<Pool[]>(getPools);

  const onSelect = (pool: Pool) => {
    goToPage.addLiquidityV2(pool.pool_dlt_id);
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

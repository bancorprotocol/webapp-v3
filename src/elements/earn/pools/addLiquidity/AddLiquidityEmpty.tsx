import { Pool } from 'services/observables/tokens';

interface Props {
  pool: Pool;
}

export const AddLiquidityEmpty = ({ pool }: Props) => {
  return <div>AddLiquidityEmpty {pool.name}</div>;
};

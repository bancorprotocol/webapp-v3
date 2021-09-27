import { Pool } from 'services/observables/tokens';

interface Props {
  pool: Pool;
}

export const AddLiquidityDual = ({ pool }: Props) => {
  return <div>AddLiquidityDual {pool.name}</div>;
};

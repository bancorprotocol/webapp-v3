import { Pool } from 'services/observables/tokens';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  return <div>AddLiquiditySingle {pool.name}</div>;
};

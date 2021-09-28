import { Pool } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';

interface Props {
  pool: Pool;
}

export const AddLiquidityDual = ({ pool }: Props) => {
  return (
    <Widget title="Add Liquidity">
      <div>{pool.name}</div>
    </Widget>
  );
};

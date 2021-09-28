import { Pool } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquiditySingleInfoBox } from './AddLiquiditySingleInfoBox';
import { AddLiquiditySingleSelectPool } from './AddLiquiditySingleSelectPool';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  return (
    <Widget title="Add Liquidity" subtitle="Single-Sided">
      <AddLiquiditySingleInfoBox />
      <AddLiquiditySingleSelectPool pool={pool} />
      <button className="btn-primary rounded w-full">Stake and Protect</button>
    </Widget>
  );
};

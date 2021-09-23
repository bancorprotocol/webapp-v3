import { AddProtectionDoubleLiq } from './AddProtectionDoubleLiq';
import { AddProtectionDouble } from './AddProtectionDouble';
import { useAppSelector } from 'redux/index';
import { APIPool } from 'services/api/bancor';
import { RouteComponentProps } from 'react-router-dom';
import { BigNumber } from 'bignumber.js';

export const AddLiquidity = (
  props: RouteComponentProps<{ anchor: string }>
) => {
  const { anchor } = props.match.params;

  const pools = useAppSelector((state) => state.bancor.pools as APIPool[]);
  if (!pools || pools.length === 0) return null;

  const foundPool = pools.find((pool) => pool.pool_dlt_id === anchor)!;

  const poolHasLiquidity = foundPool.reserves.some((reserve) =>
    new BigNumber(reserve.balance).gt(0)
  );

  return poolHasLiquidity ? (
    <AddProtectionDoubleLiq anchor={anchor} />
  ) : (
    <AddProtectionDouble anchor={anchor} />
  );
};

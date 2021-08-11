import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/api/bancor';
import { loadSwapData } from 'services/observables/triggers';
import { toChecksumAddress, isAddress } from 'web3-utils';

export const AddProtection = (
  props: RouteComponentProps<{ anchor: string }>
) => {
  const { anchor } = props.match.params;

  const isValidAnchor = isAddress(anchor);

  const dispatch = useDispatch();

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

  const isLoading = useAppSelector((state) => state.bancor.pools.length === 0);

  const pools = useAppSelector((state) => state.bancor.pools as Pool[]);
  const [selectedPool, setPool] = useState(
    pools.find(
      (pool) => pool.pool_dlt_id.toLowerCase() === anchor.toLowerCase()
    )
  );

  const [selectedToken, setToken] = useState(selectedPool?.reserves[0]);

  console.log({ isValidAnchor, selectedToken });
  if (!isValidAnchor) return <div>Invalid Anchor!</div>;

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    (
      <div className="">
        <h1>Add Protection {JSON.stringify(selectedPool)} </h1>
      </div>
    ) || <div>Invalid anchor!</div>
  );
};

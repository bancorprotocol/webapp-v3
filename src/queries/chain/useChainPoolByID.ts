import { useChainPools } from 'queries/chain/useChainPools';

export const useChainPoolByID = (id: string) => {
  const pools = useChainPools();

  //const data = pools.data?.find((pool) => pool.poolDltId === id);

  //return { ...pools, data };
};

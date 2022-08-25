import { multicall, MultiCall } from 'services/web3/multicall/multicall';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';
import { bancorMasterVault, ethToken } from 'services/web3/config';
import { fetchETH } from 'services/web3/token/token';

const buildMasterVaultBalanceCall = (poolId: string): MultiCall => {
  const contract = ContractsApi.Token(poolId).read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'balanceOf',
    methodParameters: [bancorMasterVault],
  };
};

export const fetchMasterVaultBalancesMulticall = async (
  apiPools: APIPoolV3[]
): Promise<Map<string, string> | undefined> => {
  const poolsWithoutEth = apiPools.filter(
    ({ poolDltId }) => poolDltId !== ethToken
  );

  const calls = poolsWithoutEth.map(({ poolDltId }) =>
    buildMasterVaultBalanceCall(poolDltId)
  );

  const [res, eth] = await Promise.all([
    multicall(calls),
    fetchETH(bancorMasterVault),
  ]);

  if (!res) {
    console.error('Multicall Error in fetchMasterVaultBalancesMulticall');
    return undefined;
  }

  const balanceMap = new Map(
    res.map((bn, idx) => [
      poolsWithoutEth[idx].poolDltId,
      bn && bn.length ? bn[0].toString() : undefined,
    ])
  );

  balanceMap.set(ethToken, eth);

  return balanceMap;
};

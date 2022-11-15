import { PoolToken } from 'services/observables/pools';
import { ErrorCode } from 'services/web3/types';
import { ProtectedPosition } from 'services/web3/protection/positions';

export const migrateV2Positions = async (
  positions: ProtectedPosition[],
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: Function
) => {
  // try {
  //   const liquidityProtectionContract = await liquidityProtection$
  //     .pipe(first())
  //     .toPromise();
  //   const contract = LiquidityProtection__factory.connect(
  //     liquidityProtectionContract,
  //     writeWeb3.signer
  //   );
  //   const dict = groupBy(positions, (pos) => pos.pool.pool_dlt_id);
  //   const grouped = Object.keys(dict);
  //   const posStruct = grouped.map((poolToken) => ({
  //     poolToken,
  //     reserveToken: dict[poolToken][0].reserveToken.address,
  //     positionIds: dict[poolToken].map((pos) => pos.positionId),
  //   }));
  //   const estimate = await contract.estimateGas.migratePositions(posStruct);
  //   const gasLimit = changeGas(estimate.toString());
  //   const tx = await contract.migratePositions(posStruct, { gasLimit });
  //   onHash(tx.hash);
  //   tx.wait();
  //   onCompleted();
  // } catch (e: any) {
  //   if (e.code === ErrorCode.DeniedTx) rejected();
  //   else failed();
  // }
};

// eslint-disable-next-line
export const migrateV1Positions = (poolToken: PoolToken) => {};

export const claimBntToV3 = async (
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: Function
) => {
  try {
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed();
  }
};

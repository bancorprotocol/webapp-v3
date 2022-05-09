import { first } from 'rxjs/operators';
import { liquidityProtection$ } from 'services/observables/contracts';
import { PoolToken } from 'services/observables/pools';
import { writeWeb3 } from '..';
import { LiquidityProtection__factory } from '../abis/types';
import { ErrorCode } from '../types';
import { ProtectedPosition } from './positions';

export const migrateV2Positions = async (
  positions: ProtectedPosition[],
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: Function
) => {
  try {
    const liquidityProtectionContract = await liquidityProtection$
      .pipe(first())
      .toPromise();

    const contract = LiquidityProtection__factory.connect(
      liquidityProtectionContract,
      writeWeb3.signer
    );

    const posStruct = positions.map((pos) => ({
      poolToken: pos.pool.pool_dlt_id,
      reserveToken: pos.reserveToken.address,
      positionIds: [pos.positionId],
    }));
    const tx = await contract.migratePositions(posStruct);
    onHash(tx.hash);
    tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed();
  }
};

// eslint-disable-next-line unused-imports/no-unused-vars
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

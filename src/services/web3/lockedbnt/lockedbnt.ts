import { take } from 'rxjs/operators';
import {
  liquidityProtection$,
  liquidityProtectionStore$,
} from 'services/observables/contracts';
import dayjs from 'utils/dayjs';
import { web3, writeWeb3 } from 'services/web3';
import {
  LiquidityProtectionStore__factory,
  LiquidityProtection__factory,
} from '../abis/types';
import BigNumber from 'bignumber.js';
import { ErrorCode } from '../types';

interface LockedBnt {
  balance: string;
  expirationDate: dayjs.Dayjs;
}

interface LockedAvailableBnt {
  locked: LockedBnt[];
  available: BigNumber;
}

export const fetchLockedAvailableBalances = async (
  user: string
): Promise<LockedAvailableBnt | undefined> => {
  try {
    const storeAddress = await liquidityProtectionStore$
      .pipe(take(1))
      .toPromise();
    const contract = LiquidityProtectionStore__factory.connect(
      storeAddress,
      web3.provider
    );

    const lockedBalanceCount = Number(await contract.lockedBalanceCount(user));
    if (lockedBalanceCount === 0) return;

    const lockedBalances = await contract.lockedBalanceRange(
      user,
      0,
      lockedBalanceCount
    );
  } catch (error) {
    console.error(error);
  }
};

export const claimBnt = async (
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: (error: string) => void
) => {
  try {
    const liquidityProtectionContract = await liquidityProtection$
      .pipe(take(1))
      .toPromise();
    const contract = LiquidityProtection__factory.connect(
      liquidityProtectionContract,
      writeWeb3.signer
    );

    const tx = await contract.claimBalance('0', '1000');
    onHash(tx.hash);

    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

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
import { ErrorCode } from '../types';
import { shrinkToken } from 'utils/formulas';
import { partition } from 'lodash';

export interface LockedBnt {
  bnt: number;
  expiry: number;
}

export interface LockedAvailableBnt {
  locked: LockedBnt[];
  available: number;
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

    const bnts = lockedBalances['0'];
    const expirys = lockedBalances['1'];

    const res = bnts.map((bnt, index) => ({
      bnt: Number(shrinkToken(bnt.toString(), 18)),
      expiry: Number(expirys[index]),
    }));

    const now = dayjs().unix() * 1000;
    const [available, locked] = partition(res, (x) =>
      dayjs.unix(x.expiry).isBefore(now)
    );

    const totalAvailable =
      available.length === 0
        ? 0
        : available.map((x) => x.bnt).reduce((item, prev) => item + prev);

    return {
      locked: locked.map((x) => ({ ...x, expiry: x.expiry * 1000 })),
      available: totalAvailable,
    };
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

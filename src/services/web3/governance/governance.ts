import { take } from 'rxjs/operators';
import { networkVars$ } from 'services/observables/network';
import { Token } from 'services/observables/tokens';
import { shrinkToken, expandToken } from 'utils/formulas';
import { web3, writeWeb3 } from 'services/web3';
import { ErrorCode } from '../types';
import { Governance__factory } from '../abis/types';
import dayjs from 'utils/dayjs';

export const getStakedAmount = async (
  user: string,
  govToken: Token
): Promise<string> => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = Governance__factory.connect(
    networkVars.governanceContractAddress,
    web3.provider
  );
  const amount = await govContract.votesOf(user);
  return shrinkToken(amount.toString(), govToken.decimals);
};

export const stakeAmount = async (
  amount: string,
  govToken: Token,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: Function
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = await networkVars$.pipe(take(1)).toPromise();
    const govContract = Governance__factory.connect(
      networkVars.governanceContractAddress,
      writeWeb3.signer
    );

    const tx = await govContract.stake(expandedAmount);
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed();
  }
};

export const unstakeAmount = async (
  amount: string,
  govToken: Token,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: Function
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = await networkVars$.pipe(take(1)).toPromise();
    const govContract = Governance__factory.connect(
      networkVars.governanceContractAddress,
      writeWeb3.signer
    );

    const tx = await govContract.unstake(expandedAmount);
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed();
  }
};

export const getUnstakeTimer = async (user: string) => {
  const now = dayjs().unix() * 1000;
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = Governance__factory.connect(
    networkVars.governanceContractAddress,
    web3.provider
  );
  const locks = await govContract.voteLocks(user);
  const time = Number(locks) * 1000;
  if (time - now > 0) return time;

  return undefined;
};

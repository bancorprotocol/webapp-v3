import { BigNumber } from '@0x/utils/lib/src/configured_bignumber';
import { take } from 'rxjs/operators';
import { networkVars$ } from 'services/observables/network';
import { Token } from 'services/observables/tokens';
import { shrinkToken } from 'utils/pureFunctions';
import { web3, writeWeb3 } from '../contracts';
import { buildGovernanceContract } from '../contracts/governance/wrapper';

export const getStakedAmount = async (
  user: string,
  govToken: Token
): Promise<string> => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    web3
  );
  const amount = await govContract.methods.votesOf(user).call();

  return shrinkToken(amount, govToken.decimals);
};

export const stakeAmount = async (amount: string) => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    writeWeb3
  );
  await govContract.methods.stake(amount).call();
};

export const unstakeAmount = async (amount: string) => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    writeWeb3
  );
  await govContract.methods.unstake(amount).call();
};

export const getUnstakeTimer = async () => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    web3
  );

  const [voteDuration, voteLockFraction] = await Promise.all([
    govContract.methods.voteLockDuration().call(),
    govContract.methods.voteLockFraction().call(),
  ]);

  return Number(voteDuration) / Number(voteLockFraction) / 360;
};

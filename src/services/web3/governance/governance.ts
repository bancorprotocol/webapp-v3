import { Token } from 'services/observables/tokens';
import { shrinkToken, expandToken } from 'utils/formulas';
import { web3, writeWeb3 } from 'services/web3';
import { ErrorCode } from '../types';
import { Governance__factory } from '../abis/types';
import dayjs from 'utils/dayjs';
import { getNetworkVariables, vBntDecimals } from 'services/web3/config';

export const stakeAmount = async (
  amount: string,
  govToken: Token,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: (error: string) => void,
  failed: (error: string) => void
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = getNetworkVariables();
    const govContract = Governance__factory.connect(
      networkVars.governanceContractAddress,
      writeWeb3.signer
    );

    const tx = await govContract.stake(expandedAmount);
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected(e.message);
    else failed(e.message);
  }
};

export const unstakeAmount = async (
  amount: string,
  govToken: Token,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: (error: string) => void,
  failed: (error: string) => void
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = getNetworkVariables();
    const govContract = Governance__factory.connect(
      networkVars.governanceContractAddress,
      writeWeb3.signer
    );

    const tx = await govContract.unstake(expandedAmount);
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected(e.message);
    else failed(e.message);
  }
};

export const getStakedAmount = async (user: string): Promise<string> => {
  const networkVars = getNetworkVariables();
  const govContract = Governance__factory.connect(
    networkVars.governanceContractAddress,
    web3.provider
  );
  const amount = await govContract.votesOf(user);
  return shrinkToken(amount.toString(), vBntDecimals);
};

export const getUnstakeTimer = async (user: string) => {
  const now = dayjs().unix() * 1000;
  const networkVars = getNetworkVariables();
  const govContract = Governance__factory.connect(
    networkVars.governanceContractAddress,
    web3.provider
  );
  const locks = await govContract.voteLocks(user);
  const time = Number(locks) * 1000;
  if (time - now > 0) return time;

  return undefined;
};

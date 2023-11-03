import { Token } from 'services/observables/tokens';
import { shrinkToken, expandToken } from 'utils/formulas';
import { web3, writeWeb3 } from 'services/web3';
import { ErrorCode } from '../types';
import { Governance__factory } from '../abis/types';
import dayjs from 'utils/dayjs';
import {
  bntDecimals,
  getNetworkVariables,
  vBntDecimals,
} from 'services/web3/config';

export const stakeAmount = async (
  amount: string,
  govToken: Token,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: (error: string) => void,
  failed: (error: string) => void
) => {
  try {
    const networkVars = getNetworkVariables();
    const address =
      govToken.symbol === 'BNT'
        ? networkVars.governanceBntContractAddress
        : networkVars.governanceVbntContractAddress;

    const govContract = Governance__factory.connect(address, writeWeb3.signer);

    const expandedAmount = expandToken(amount, govToken.decimals);
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
    const networkVars = getNetworkVariables();
    const address =
      govToken.symbol === 'BNT'
        ? networkVars.governanceBntContractAddress
        : networkVars.governanceVbntContractAddress;

    const govContract = Governance__factory.connect(address, writeWeb3.signer);

    const expandedAmount = expandToken(amount, govToken.decimals);
    const tx = await govContract.unstake(expandedAmount);
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected(e.message);
    else failed(e.message);
  }
};

export const getStakedAmount = async (
  user: string,
  isBnt: boolean
): Promise<string> => {
  const networkVars = getNetworkVariables();
  const address = isBnt
    ? networkVars.governanceBntContractAddress
    : networkVars.governanceVbntContractAddress;
  const decimals = isBnt ? bntDecimals : vBntDecimals;

  const govContract = Governance__factory.connect(address, web3.provider);
  const amount = await govContract.votesOf(user);
  return shrinkToken(amount.toString(), decimals);
};

export const getUnstakeTimer = async (user: string, isBnt: boolean) => {
  const now = dayjs().unix() * 1000;
  const networkVars = getNetworkVariables();
  const address = isBnt
    ? networkVars.governanceBntContractAddress
    : networkVars.governanceVbntContractAddress;
  const govContract = Governance__factory.connect(address, web3.provider);
  const locks = await govContract.voteLocks(user);
  const time = Number(locks) * 1000;
  if (time - now > 0) return time;

  return undefined;
};

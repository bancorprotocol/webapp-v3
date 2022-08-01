import { Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import {
  bancorNetwork$,
  exchangeProxy$,
  liquidityProtection$,
} from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { user$ } from 'services/observables/user';
import {
  NULL_APPROVAL_CONTRACTS,
  UNLIMITED_WEI,
} from 'services/web3/approval/constants';
import { ethToken, getNetworkVariables } from 'services/web3/config';
import { expandToken } from 'utils/formulas';
import { ContractsApi } from 'services/web3/v3/contractsApi';

interface GetApprovalReturn {
  allowanceWei: string;
  isApprovalRequired: boolean;
}

export enum ApprovalContract {
  BancorNetwork,
  BancorNetworkV3,
  ExchangeProxy,
  LiquidityProtection,
  Governance,
}

export const getApproval = async (
  token: string,
  user: string,
  spender: string,
  amountWei: string
): Promise<GetApprovalReturn> => {
  if (token === ethToken)
    return { allowanceWei: '', isApprovalRequired: false };

  const allowanceWei = (
    await ContractsApi.Token(token).read.allowance(user, spender)
  ).toString();

  const isApprovalRequired = new BigNumber(amountWei).gt(
    new BigNumber(allowanceWei)
  );
  return { allowanceWei, isApprovalRequired };
};

export const setApproval = async (
  token: string,
  user: string,
  spender: string,
  amountWei?: string,
  resolveImmediately?: boolean
): Promise<string> => {
  const isEth = token === ethToken;
  if (isEth) return '';

  const amountFinal = amountWei ? amountWei : UNLIMITED_WEI;

  const isNullApprovalContract = NULL_APPROVAL_CONTRACTS.includes(token);

  if (isNullApprovalContract) {
    const { allowanceWei } = await getApproval(
      token,
      user,
      spender,
      amountFinal
    );
    if (Number(allowanceWei) !== 0) {
      const tx = await ContractsApi.Token(token).write.approve(spender, '0');
      await tx.wait();
    }
  }

  try {
    const tx = await ContractsApi.Token(token).write.approve(
      spender,
      amountFinal
    );
    if (!resolveImmediately) await tx.wait();
    return tx.hash;
  } catch (e: any) {
    const isTxDenied = e.message.toLowerCase().includes('denied');

    if (!isTxDenied) {
      // TODO send this error with failed contract to Sentry or GTM
      NULL_APPROVAL_CONTRACTS.push(token);
      console.error(
        'Approval had failed, next try forcing a zero approval in case required',
        e.message
      );
    }

    throw e;
  }
};

export const getNetworkContractApproval = async (
  token: Token,
  contract: ApprovalContract | string,
  amount: string
): Promise<boolean> => {
  const user = await user$.pipe(take(1)).toPromise();
  const amountWei = expandToken(amount, token.decimals);
  const { isApprovalRequired } = await getApproval(
    token.address,
    user,
    await getApprovalAddress(contract),
    amountWei
  );
  return isApprovalRequired;
};

export const setNetworkContractApproval = async (
  token: Token,
  contract: ApprovalContract | string,
  amount?: string,
  resolveImmediately?: boolean
) => {
  const user = await user$.pipe(take(1)).toPromise();
  const amountWei = amount ? expandToken(amount, token.decimals) : undefined;
  return await setApproval(
    token.address,
    user,
    await getApprovalAddress(contract),
    amountWei,
    resolveImmediately
  );
};

export const getApprovalAddress = async (
  contract: ApprovalContract | string
): Promise<string> => {
  if (typeof contract === 'string') return contract;

  switch (contract) {
    case ApprovalContract.BancorNetwork:
      return await bancorNetwork$.pipe(take(1)).toPromise();
    case ApprovalContract.BancorNetworkV3:
      return ContractsApi.BancorNetwork.contractAddress;
    case ApprovalContract.ExchangeProxy:
      return await exchangeProxy$.pipe(take(1)).toPromise();
    case ApprovalContract.LiquidityProtection:
      return await liquidityProtection$.pipe(take(1)).toPromise();
    case ApprovalContract.Governance:
      return getNetworkVariables().governanceContractAddress;
  }
};

export const resetApproval = async (
  contract: string,
  user: string,
  token: string
): Promise<void> => {
  const tx = await ContractsApi.Token(token).write.approve(contract, '0');
  await tx.wait();
};

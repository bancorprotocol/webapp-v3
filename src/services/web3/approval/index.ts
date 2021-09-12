import { Token } from 'services/observables/tokens';
import { web3, writeWeb3 } from 'services/web3';
import BigNumber from 'bignumber.js';
import { resolveTxOnConfirmation } from 'services/web3/index';
import { bancorNetwork$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { user$ } from 'services/observables/user';
import {
  NULL_APPROVAL_CONTRACTS,
  UNLIMITED_WEI,
} from 'services/web3/approval/constants';
import { ethToken } from 'services/web3/config';
import { expandToken } from 'utils/formulas';
import { Token__factory } from '../abis/types';

interface GetApprovalReturn {
  allowanceWei: string;
  isApprovalRequired: boolean;
}

const getApproval = async (
  token: string,
  user: string,
  spender: string,
  amountWei: string
): Promise<GetApprovalReturn> => {
  if (token === ethToken)
    return { allowanceWei: '', isApprovalRequired: false };

  const tokenContract = Token__factory.connect(token, web3);
  const allowanceWei = (
    await tokenContract.allowance(user, spender)
  ).toString();

  const isApprovalRequired = new BigNumber(amountWei).gt(
    new BigNumber(allowanceWei)
  );
  return { allowanceWei, isApprovalRequired };
};

const setApproval = async (
  token: string,
  user: string,
  spender: string,
  amountWei?: string
): Promise<string> => {
  const isEth = token === ethToken;
  if (isEth) return '';

  const tokenContract = Token__factory.connect(token, writeWeb3);

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
      const tx = await tokenContract.approve(spender, '0');
      await resolveTxOnConfirmation({ tx, user, resolveImmediately: true });
    }
  }

  const tx = await tokenContract.approve(spender, amountFinal);
  try {
    return await resolveTxOnConfirmation({
      tx,
      user,
      resolveImmediately: true,
    });
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
  amount: string,
  contract?: string
): Promise<boolean> => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();
  const amountWei = expandToken(amount, token.decimals);
  const { isApprovalRequired } = await getApproval(
    token.address,
    USER,
    contract ? contract : BANCOR_NETWORK,
    amountWei
  );
  return isApprovalRequired;
};

export const setNetworkContractApproval = async (
  token: Token,
  amount?: string,
  contract?: string
) => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();
  const amountWei = amount ? expandToken(amount, token.decimals) : undefined;
  return await setApproval(
    token.address,
    USER,
    contract ? contract : BANCOR_NETWORK,
    amountWei
  );
};

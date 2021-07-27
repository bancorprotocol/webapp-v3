import { Token } from 'services/observables/tokens';
import { expandToken } from 'utils/pureFunctions';
import { web3, writeWeb3 } from 'services/web3/contracts';
import BigNumber from 'bignumber.js';
import { buildTokenContract } from 'services/web3/contracts/token/wrapper';
import { resolveTxOnConfirmation } from 'services/web3/index';
import { bancorNetwork$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { user$ } from 'services/observables/user';
import {
  NULL_APPROVAL_CONTRACTS,
  UNLIMITED_WEI,
} from 'services/web3/approval/constants';
import { ethToken } from 'services/web3/config';

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

  const tokenContract = buildTokenContract(token, web3);
  const allowanceWei = await tokenContract.methods
    .allowance(user, spender)
    .call();
  const isApprovalRequired = new BigNumber(amountWei).gt(allowanceWei);
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

  const tokenContract = buildTokenContract(token, writeWeb3);

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
      const tx = await tokenContract.methods.approve(spender, '0');
      await resolveTxOnConfirmation({ tx, user, resolveImmediately: true });
    }
  }

  const tx = await tokenContract.methods.approve(spender, amountFinal);
  try {
    return await resolveTxOnConfirmation({
      tx,
      user,
      resolveImmediately: true,
    });
  } catch (e) {
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
  amount: string
): Promise<boolean> => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();
  const amountWei = expandToken(amount, token.decimals);
  const { isApprovalRequired } = await getApproval(
    token.address,
    USER,
    BANCOR_NETWORK,
    amountWei
  );
  return isApprovalRequired;
};

export const setNetworkContractApproval = async (
  token: Token,
  amount?: string
) => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();
  const amountWei = amount ? expandToken(amount, token.decimals) : undefined;
  return await setApproval(token.address, USER, BANCOR_NETWORK, amountWei);
};

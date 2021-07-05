import { TokenListItem } from 'services/observables/tokens';
import { expandToken } from 'utils/pureFunctions';
import { web3 } from 'services/web3/contracts';
import BigNumber from 'bignumber.js';
import { UNLIMITED_WEI } from 'utils/constants';
import { buildTokenContract } from 'services/web3/contracts/token/wrapper';
import { resolveTxOnConfirmation } from 'services/web3/index';
import { bancorNetwork$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { user$ } from 'services/observables/user';

// returns true if approval is required, else false
const getApproval = async (
  token: TokenListItem,
  user: string,
  spender: string,
  amount: string
): Promise<boolean> => {
  const amountWei = expandToken(amount, token.decimals);

  const tokenContract = buildTokenContract(token.address, web3);
  const currentApprovedBalance = await tokenContract.methods
    .allowance(user, spender)
    .call();

  return new BigNumber(amountWei).gt(currentApprovedBalance);
};

// Prop AMOUNT set undefined for UNLIMITED
const setApproval = async (
  token: TokenListItem,
  user: string,
  spender: string,
  amount?: string
): Promise<void> => {
  const amountWei = amount
    ? expandToken(amount, token.decimals)
    : UNLIMITED_WEI;
  const tokenContract = buildTokenContract(token.address, web3);
  const tx = tokenContract.methods.approve(spender, amountWei);
  await resolveTxOnConfirmation({
    tx,
    user,
  });
};

// Check BancorNetwork token approval
export const getNetworkContractApproval = async (
  token: TokenListItem,
  amount: string
): Promise<boolean> => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();

  return getApproval(token, USER, BANCOR_NETWORK, amount);
};

// Set BancorNetwork token approval - if prop AMOUNT is UNDEFINED set unlimited
export const setNetworkContractApproval = async (
  token: TokenListItem,
  amount?: string
): Promise<void> => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();

  await setApproval(token, USER, BANCOR_NETWORK, amount);
};

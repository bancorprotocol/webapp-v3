import { TokenListItem } from 'services/observables/tokens';
import { compareString, expandToken } from 'utils/pureFunctions';
import { web3 } from 'services/web3/contracts';
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

// Generic method that returns allowance in wei and isApprovalRequired as bool
const getApproval = async (
  token: string,
  user: string,
  spender: string,
  amountWei: string
): Promise<GetApprovalReturn> => {
  // if token is ETH no approval is required
  const isEth = compareString(token, ethToken);
  if (isEth) return { allowanceWei: '', isApprovalRequired: false };

  const tokenContract = buildTokenContract(token, web3);
  const allowanceWei = await tokenContract.methods
    .allowance(user, spender)
    .call();
  const isApprovalRequired = new BigNumber(amountWei).gt(allowanceWei);
  return { allowanceWei, isApprovalRequired };
};

// Generic set approval method. Returns tx hash. Prop AMOUNT set undefined for UNLIMITED
const setApproval = async (
  token: string,
  user: string,
  spender: string,
  amountWei?: string
): Promise<string> => {
  // if token is ETH dont set approval
  const isEth = compareString(token, ethToken);
  if (isEth) return '';

  const tokenContract = buildTokenContract(token, web3);

  // set limited or unlimited amount
  const amountFinal = amountWei ? amountWei : UNLIMITED_WEI;

  // check if nulling allowance required for this contract
  const isNullApprovalContract = NULL_APPROVAL_CONTRACTS.some((contract) =>
    compareString(contract, token)
  );

  // if nulling required, call null approval method
  if (isNullApprovalContract) {
    const { allowanceWei } = await getApproval(
      token,
      user,
      spender,
      amountFinal
    );
    if (Number(allowanceWei) !== 0) {
      const tx = await tokenContract.methods.approve(spender, '0');
      await resolveTxOnConfirmation({ tx, user });
    }
  }

  // set final approval amount
  const tx = await tokenContract.methods.approve(spender, amountFinal);
  try {
    return await resolveTxOnConfirmation({ tx, user });
  } catch (e) {
    const isTxDenied = e.message.toLowerCase().includes('denied');
    // if tx fails because other than user denied, add token to null approval list for next try in case contract is missing in list
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

// Check BancorNetwork token approval
export const getNetworkContractApproval = async (
  token: TokenListItem,
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

// Set approval method for BancorNetwork contract. Returns tx hash. if prop AMOUNT is UNDEFINED set unlimited approval
export const setNetworkContractApproval = async (
  token: TokenListItem,
  amount?: string
) => {
  const BANCOR_NETWORK = await bancorNetwork$.pipe(take(1)).toPromise();
  const USER = await user$.pipe(take(1)).toPromise();
  const amountWei = amount ? expandToken(amount, token.decimals) : undefined;
  return await setApproval(token.address, USER, BANCOR_NETWORK, amountWei);
};

import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { CallReturn } from 'eth-multicall';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods } from 'services/web3/types';
import { buildContract, web3 } from '..';
import { ABISmartToken } from './abi';
import { toHex } from 'web3-utils';
import { bancorNetwork$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { TokenListItem } from 'services/observables/tokens';
import { expandToken } from 'utils/pureFunctions';
import { UNLIMITED_WEI } from 'utils/constants';

interface TokenContractType {
  symbol: () => CallReturn<string>;
  decimals: () => CallReturn<string>;
  owner: () => CallReturn<string>;
  totalSupply: () => CallReturn<string>;
  allowance: (owner: string, spender: string) => CallReturn<string>;
  balanceOf: (owner: string) => CallReturn<string>;
  transferOwnership: (converterAddress: string) => ContractSendMethod;
  issue: (address: string, wei: string) => ContractSendMethod;
  transfer: (to: string, weiAmount: string) => ContractSendMethod;
  approve: (
    approvedAddress: string,
    approvedAmount: string
  ) => ContractSendMethod;
}
export const buildTokenContract = (
  contractAddress: string,
  web3: Web3
): ContractMethods<TokenContractType> =>
  buildContract(ABISmartToken, contractAddress, web3);

export const getApprovalRequired = async (
  token: TokenListItem,
  amount: string,
  owner: string,
  spender: string
): Promise<boolean> => {
  const amountWei = expandToken(amount, token.decimals);

  const tokenContract = buildTokenContract(token.address, web3);
  const currentApprovedBalance = await tokenContract.methods
    .allowance(owner, spender)
    .call();

  return new BigNumber(amountWei).gt(currentApprovedBalance);
};

export const approveTokenSwap = async (
  token: TokenListItem,
  owner: string,
  amount: string | null,
  spender: string
) => {
  const amountWei = amount
    ? expandToken(amount, token.decimals)
    : UNLIMITED_WEI;
  const tokenContract = buildTokenContract(token.address, web3);
  const result = await tokenContract.methods
    .approve(spender, amountWei)
    .send({ from: owner });
  console.log('approve tx result', result);
};

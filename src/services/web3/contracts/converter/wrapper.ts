import Web3 from 'web3';
import { CallReturn } from 'eth-multicall';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods, TokenAndAmount } from 'services/web3/types';
import { buildContract } from 'services/web3/contracts';
import { ABIConverter } from 'services/web3/contracts/converter/abi';
import { Pool } from 'services/api/bancor';
import { Token, tokens$ } from 'services/observables/tokens';
import { first, take } from 'rxjs/operators';
import { expandToken } from 'utils/formulas';
import { resolveTxOnConfirmation } from 'services/web3';
import { onLogin$, user$ } from 'services/observables/user';
import { ethToken } from 'services/web3/config';
import { getApproval } from 'services/web3/approval';
import { isAddress } from 'web3-utils';

export const buildConverterContract = (
  contractAddress?: string,
  web3?: Web3
): ContractMethods<{
  addLiquidity: (
    reserveTokens: string[],
    reserveAmounts: string[],
    minReturn: string
  ) => ContractSendMethod;
  reserveBalances: () => CallReturn<any>;
  acceptTokenOwnership: () => ContractSendMethod;
  reserves: (reserveAddress: string) => CallReturn<any[]>;
  reserveBalance: (reserveAddress: string) => CallReturn<string>;
  getConnectorBalance: (reserveAddress: string) => CallReturn<string>;
  getReserveBalance: (reserveAdress: string) => CallReturn<string>;
  acceptOwnership: () => ContractSendMethod;
  fund: (fundAmount: string) => ContractSendMethod;
  liquidate: (fundAmount: string) => ContractSendMethod;
  setConversionFee: (ppm: string) => ContractSendMethod;
  addReserve: (
    reserveAddress: string,
    connectorWeight: number
  ) => ContractSendMethod;
  getSaleReturn: (
    toAddress: string,
    wei: string
  ) => CallReturn<{ '0': string; '1': string }>;
  getReturn: (
    fromTokenAddress: string,
    toTokenAddress: string,
    wei: string
  ) => CallReturn<{ '0': string; '1': string }>;
  owner: () => CallReturn<string>;
  version: () => CallReturn<string>;
  connectorTokenCount: () => CallReturn<string>;
  connectorTokens: (index: number) => CallReturn<string>;
  conversionFee: () => CallReturn<string>;
  geometricMean: (weis: string[]) => CallReturn<string>;
}> => buildContract(ABIConverter, contractAddress, web3);

export const getTokenContractApproval = async (
  token: Token,
  decAmount: string,
  converterAddress: string
): Promise<boolean> => {
  if (!isAddress(converterAddress) || !isAddress(token.address))
    throw new Error(
      `Invalid contract address of ${converterAddress} ${JSON.stringify(
        token
      )} passed to getContractApproval`
    );
  const USER = await user$.pipe(take(1)).toPromise();
  if (!isAddress(USER)) throw new Error(`Failed to find user address ${USER}`);
  const amountWei = expandToken(decAmount, token.decimals);
  const { isApprovalRequired } = await getApproval(
    token.address,
    USER,
    converterAddress,
    amountWei
  );
  return isApprovalRequired;
};

export const addLiquidity = async (
  amounts: TokenAndAmount[],
  converterAddress: string
) => {
  const contract = buildConverterContract(converterAddress);
  const user = await onLogin$.pipe(first()).toPromise();

  const amountsWei = amounts.map((amount) => ({
    address: amount.token.address,
    weiAmount: expandToken(amount.decAmount, amount.token.decimals),
  }));

  const tx = contract.methods.addLiquidity(
    amountsWei.map(({ address }) => address),
    amountsWei.map(({ weiAmount }) => weiAmount),
    '1'
  );

  const ethAmount = amountsWei.find((amount) => amount.address === ethToken);

  return resolveTxOnConfirmation({
    tx,
    user,
    value: ethAmount?.weiAmount,
    resolveImmediately: true,
  });
};

export const fetchPoolReserveBalances = async (
  pool: Pool,
  blockHeight?: number
) => {
  const contract = buildConverterContract(pool.converter_dlt_id);
  return Promise.all(
    pool.reserves.map(async (reserve) => {
      const weiAmount = await contract.methods
        .getConnectorBalance(reserve.address)
        .call(undefined, blockHeight);

      return {
        contract: reserve.address,
        weiAmount,
      };
    })
  );
};

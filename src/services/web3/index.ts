import { Web3Provider } from '@ethersproject/providers';
import {
  Contract,
  ContractInterface,
  ContractTransaction,
} from '@ethersproject/contracts';
import { EthNetworks } from 'services/web3//types';
import { providers, Signer } from 'ethers';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';

export const web3 = {
  provider: new providers.JsonRpcProvider(buildAlchemyUrl(EthNetworks.Mainnet)),
};

export const writeWeb3 = {
  signer: window.ethereum
    ? new Web3Provider(window.ethereum).getSigner()
    : new providers.JsonRpcProvider(
        buildAlchemyUrl(EthNetworks.Mainnet)
      ).getSigner(),
};

export const setProvider = (provider: providers.JsonRpcProvider) => {
  web3.provider = provider;
};

export const setSigner = (signer: providers.JsonRpcSigner) => {
  writeWeb3.signer = signer;
};

export const buildContract = (
  abi: ContractInterface,
  contractAddress: string,
  injectedWeb3?: Web3Provider | Signer
) => new Contract(contractAddress, abi, injectedWeb3 || web3.provider);

export const resolveTxOnConfirmation = async ({
  tx,
  value,
  resolveImmediately = false,
  user,
  onHash,
  onConfirmation,
}: {
  tx: ContractTransaction;
  value?: string;
  resolveImmediately?: boolean;
  user: string;
  onHash?: (hash: string) => void;
  onConfirmation?: (hash: string) => void;
}): Promise<string> => {
  const trans = await tx.wait();
  return trans.transactionHash;
  // return new Promise((resolve, reject) => {
  //   let txHash: string;
  //   tx.from = user;

  //   const res = await tx.wait();
  //   res;
  //   send({
  //     from: user,
  //     ...(adjustedGas && { gas: adjustedGas as number }),
  //     ...(value && { value: utils.hexlify(value) }),
  //   })
  //     .on('transactionHash', (hash: string) => {
  //       txHash = hash;
  //       if (onHash) onHash(hash);
  //       if (resolveImmediately) {
  //         resolve(txHash);
  //       }
  //     })
  //     .on('confirmation', (confirmationNumber: number) => {
  //       if (confirmationNumber === 1) {
  //         if (onConfirmation) onConfirmation(txHash);
  //         resolve(txHash);
  //       }
  //     })
  //     .on('error', (error: any) => reject(error));
  // });
};

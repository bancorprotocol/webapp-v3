import { web3, writeWeb3 } from 'services/web3/index';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export class BancorV3Contract<T> {
  constructor(contractAddress: string, contractFactory: any) {
    this.contractAddress = contractAddress;
    this.read = contractFactory.connect(contractAddress, web3.provider);
    this.write = contractFactory.connect(contractAddress, writeWeb3.signer);
  }
  public readonly contractAddress: string;
  public readonly read: T;
  public readonly write: T;
}

export const contractsApi = new ContractsApi();

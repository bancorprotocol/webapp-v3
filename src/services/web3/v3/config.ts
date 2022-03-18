import { web3, writeWeb3 } from 'services/web3/index';

export const CONTRACT_ADDRESSES_V3 = {
  NetworkSettingsV1: '0x302979c8f478279Ab3F46Ce3Dc96c98d9c28fb0c',
  StandardStakingRewardsV1: '0x3c497b7086d91927a6EbaB57dDbE70dD54b30EA9',
  BancorNetworkV1: '0x093C761bd5B8f71d72cBC74A72cc9c6aEDC8EE49',
};

export class BancorV3ContractBase<T> {
  constructor(contractAddress: string, contractFactory: any) {
    this.contractAddress = contractAddress;
    this.read = contractFactory.connect(contractAddress, web3.provider);
    this.write = contractFactory.connect(contractAddress, writeWeb3.signer);
  }
  public readonly contractAddress: string;
  public readonly read: T;
  public readonly write: T;
}

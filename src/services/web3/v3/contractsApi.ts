import {
  BancorNetworkV3,
  BancorNetworkV3__factory,
  BancorNetworkInfoV3,
  BancorNetworkInfoV3__factory,
  NetworkSettingsV3,
  NetworkSettingsV3__factory,
  StandardStakingRewardsV3,
  StandardStakingRewardsV3__factory,
} from 'services/web3/abis/types';
import { web3, writeWeb3 } from 'services/web3/index';

class BancorV3Contract<T> {
  constructor(contractAddress: string, contractFactory: any) {
    this.contractAddress = contractAddress;
    this.read = contractFactory.connect(contractAddress, web3.provider);
    this.write = contractFactory.connect(contractAddress, writeWeb3.signer);
  }
  public readonly contractAddress: string;
  public readonly read: T;
  public readonly write: T;
}

const CONTRACT_ADDRESSES_V3 = {
  NetworkSettings: '0x302979c8f478279Ab3F46Ce3Dc96c98d9c28fb0c',
  StandardStakingRewards: '0x3c497b7086d91927a6EbaB57dDbE70dD54b30EA9',
  BancorNetwork: '0x093C761bd5B8f71d72cBC74A72cc9c6aEDC8EE49',
  BancorNetworkInfo: '0x6B0aF7Dc3cD9d4eAf6ecea4584F4177694eDC820',
};

export abstract class ContractsApi {
  static BancorNetwork = new BancorV3Contract<BancorNetworkV3>(
    CONTRACT_ADDRESSES_V3.BancorNetwork,
    BancorNetworkV3__factory
  );

  static BancorNetworkInfo = new BancorV3Contract<BancorNetworkInfoV3>(
    CONTRACT_ADDRESSES_V3.BancorNetworkInfo,
    BancorNetworkInfoV3__factory
  );

  static NetworkSettings = new BancorV3Contract<NetworkSettingsV3>(
    CONTRACT_ADDRESSES_V3.NetworkSettings,
    NetworkSettingsV3__factory
  );

  static StandardStakingRewards =
    new BancorV3Contract<StandardStakingRewardsV3>(
      CONTRACT_ADDRESSES_V3.StandardStakingRewards,
      StandardStakingRewardsV3__factory
    );
}

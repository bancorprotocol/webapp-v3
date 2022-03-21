import {
  BancorNetworkV3,
  BancorNetworkV3__factory,
  BancorNetworkInfoV3,
  BancorNetworkInfoV3__factory,
  NetworkSettingsV3,
  NetworkSettingsV3__factory,
  StandardStakingRewardsV3,
  StandardStakingRewardsV3__factory,
  AutoCompoundingStakingRewardsV3,
  AutoCompoundingStakingRewardsV3__factory,
} from 'services/web3/abis/types';
import { web3, writeWeb3 } from 'services/web3/index';
import { ContractDict } from 'services/web3/v3/config';

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

export abstract class ContractsApi {
  static BancorNetwork = new BancorV3Contract<BancorNetworkV3>(
    ContractDict.bancorV3.BancorNetwork,
    BancorNetworkV3__factory
  );

  static BancorNetworkInfo = new BancorV3Contract<BancorNetworkInfoV3>(
    ContractDict.bancorV3.BancorNetworkInfo,
    BancorNetworkInfoV3__factory
  );

  static NetworkSettings = new BancorV3Contract<NetworkSettingsV3>(
    ContractDict.bancorV3.NetworkSettings,
    NetworkSettingsV3__factory
  );

  static StandardStakingRewards =
    new BancorV3Contract<StandardStakingRewardsV3>(
      ContractDict.bancorV3.StandardStakingRewards,
      StandardStakingRewardsV3__factory
    );

  static AutoCompoundingStakingRewards =
    new BancorV3Contract<AutoCompoundingStakingRewardsV3>(
      ContractDict.bancorV3.AutoCompoundingStakingRewards,
      AutoCompoundingStakingRewardsV3__factory
    );
}

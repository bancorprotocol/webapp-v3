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

export abstract class ContractsApi {
  static BancorNetwork = new BancorV3Contract<BancorNetworkV3>(
    process.env.REACT_APP_BANCOR_V3_CONTRACT_NETWORK_SETTINGS,
    BancorNetworkV3__factory
  );

  static BancorNetworkInfo = new BancorV3Contract<BancorNetworkInfoV3>(
    process.env.REACT_APP_BANCOR_V3_CONTRACT_BANCOR_NETWORK_INFO,
    BancorNetworkInfoV3__factory
  );

  static NetworkSettings = new BancorV3Contract<NetworkSettingsV3>(
    process.env.REACT_APP_BANCOR_V3_CONTRACT_NETWORK_SETTINGS,
    NetworkSettingsV3__factory
  );

  static StandardStakingRewards =
    new BancorV3Contract<StandardStakingRewardsV3>(
      process.env.REACT_APP_BANCOR_V3_CONTRACT_STANDARD_STAKING_REWARDS,
      StandardStakingRewardsV3__factory
    );
}

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
import {
  bancorNetwork,
  bancorNetworkInfo,
  networkSettings,
  standardStakingRewards,
} from '../config';

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
    bancorNetwork,
    BancorNetworkV3__factory
  );

  static BancorNetworkInfo = new BancorV3Contract<BancorNetworkInfoV3>(
    bancorNetworkInfo,
    BancorNetworkInfoV3__factory
  );

  static NetworkSettings = new BancorV3Contract<NetworkSettingsV3>(
    networkSettings,
    NetworkSettingsV3__factory
  );

  static StandardStakingRewards =
    new BancorV3Contract<StandardStakingRewardsV3>(
      standardStakingRewards,
      StandardStakingRewardsV3__factory
    );
}

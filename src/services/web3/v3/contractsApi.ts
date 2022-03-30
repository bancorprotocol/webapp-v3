import {
  BancorNetworkV1,
  BancorNetworkV1__factory,
  BancorNetworkInfoV1,
  BancorNetworkInfoV1__factory,
  NetworkSettingsV1,
  NetworkSettingsV1__factory,
  StandardStakingRewardsV1,
  StandardStakingRewardsV1__factory,
  PoolCollectionType1V1,
  PoolCollectionType1V1__factory,
  PendingWithdrawalsV1,
  PendingWithdrawalsV1__factory,
} from 'services/web3/abis/types';
import { web3, writeWeb3 } from 'services/web3/index';
import {
  bancorNetwork,
  bancorNetworkInfo,
  networkSettings,
  pendingWithdrawals,
  poolCollectionType1,
  standardStakingRewards,
} from '../config';

class BancorV1Contract<T> {
  constructor(contractAddress: string, contractFactory: any) {
    this.contractAddress = contractAddress;
    this._contractFactory = contractFactory;
    this._read = contractFactory.connect(contractAddress, web3.provider);
    this._write = contractFactory.connect(contractAddress, writeWeb3.signer);
  }

  public readonly contractAddress: string;

  private readonly _contractFactory: any;
  private _lastProvider = web3.provider;
  private _lastSigner = writeWeb3.signer;
  private _read: T;
  private _write: T;

  get read(): T {
    if (this._lastProvider === web3.provider) {
      return this._read;
    }
    this._lastProvider = web3.provider;
    this._read = this._contractFactory.connect(
      this.contractAddress,
      web3.provider
    );
    return this._read;
  }

  get write(): T {
    if (this._lastSigner === writeWeb3.signer) {
      return this._write;
    }
    this._lastSigner = writeWeb3.signer;
    this._write = this._contractFactory.connect(
      this.contractAddress,
      writeWeb3.signer
    );
    return this._write;
  }
}

export abstract class ContractsApi {
  static BancorNetwork = new BancorV1Contract<BancorNetworkV1>(
    bancorNetwork,
    BancorNetworkV1__factory
  );

  static BancorNetworkInfo = new BancorV1Contract<BancorNetworkInfoV1>(
    bancorNetworkInfo,
    BancorNetworkInfoV1__factory
  );

  static NetworkSettings = new BancorV1Contract<NetworkSettingsV1>(
    networkSettings,
    NetworkSettingsV1__factory
  );

  static StandardStakingRewards =
    new BancorV1Contract<StandardStakingRewardsV1>(
      standardStakingRewards,
      StandardStakingRewardsV1__factory
    );

  static PoolCollection = new BancorV1Contract<PoolCollectionType1V1>(
    poolCollectionType1,
    PoolCollectionType1V1__factory
  );

  static PendingWithdrawals = new BancorV1Contract<PendingWithdrawalsV1>(
    pendingWithdrawals,
    PendingWithdrawalsV1__factory
  );
}

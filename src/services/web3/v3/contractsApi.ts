import {
  Token,
  Token__factory,
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
import { providers } from 'ethers';

class BancorContract<T> {
  constructor(contractAddress: string, contractFactory: any) {
    this.contractAddress = contractAddress;
    this._contractFactory = contractFactory;
  }

  public readonly contractAddress: string;

  private readonly _contractFactory: any;
  private _lastProvider: providers.BaseProvider | undefined;
  private _lastSigner: providers.JsonRpcSigner | undefined;
  private _read: T | undefined;
  private _write: T | undefined;

  get read(): T {
    if (this._lastProvider === web3.provider && this._read) {
      return this._read;
    }
    this._lastProvider = web3.provider;
    this._read = this._contractFactory.connect(
      this.contractAddress,
      web3.provider
    ) as T;
    return this._read;
  }

  get write(): T {
    if (this._lastSigner === writeWeb3.signer && this._write) {
      return this._write;
    }
    this._lastSigner = writeWeb3.signer;
    this._write = this._contractFactory.connect(
      this.contractAddress,
      writeWeb3.signer
    ) as T;
    return this._write;
  }
}

export abstract class ContractsApi {
  static BancorNetwork = new BancorContract<BancorNetworkV1>(
    bancorNetwork,
    BancorNetworkV1__factory
  );

  static BancorNetworkInfo = new BancorContract<BancorNetworkInfoV1>(
    bancorNetworkInfo,
    BancorNetworkInfoV1__factory
  );

  static NetworkSettings = new BancorContract<NetworkSettingsV1>(
    networkSettings,
    NetworkSettingsV1__factory
  );

  static StandardStakingRewards = new BancorContract<StandardStakingRewardsV1>(
    standardStakingRewards,
    StandardStakingRewardsV1__factory
  );

  static PoolCollection = new BancorContract<PoolCollectionType1V1>(
    poolCollectionType1,
    PoolCollectionType1V1__factory
  );

  static PendingWithdrawals = new BancorContract<PendingWithdrawalsV1>(
    pendingWithdrawals,
    PendingWithdrawalsV1__factory
  );

  static Token = (tokenAddress: string) => {
    return new BancorContract<Token>(tokenAddress, Token__factory);
  };
}

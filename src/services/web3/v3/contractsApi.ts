import {
  Token,
  Token__factory,
  BancorNetworkV3,
  BancorNetworkV3__factory,
  BancorNetworkInfo,
  BancorNetworkInfo__factory,
  NetworkSettings,
  NetworkSettings__factory,
  StandardStakingRewards,
  StandardStakingRewards__factory,
  PoolCollectionType1,
  PoolCollectionType1__factory,
  PendingWithdrawals,
  PendingWithdrawals__factory,
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
  static BancorNetwork = new BancorContract<BancorNetworkV3>(
    bancorNetwork,
    BancorNetworkV3__factory
  );

  static BancorNetworkInfo = new BancorContract<BancorNetworkInfo>(
    bancorNetworkInfo,
    BancorNetworkInfo__factory
  );

  static NetworkSettings = new BancorContract<NetworkSettings>(
    networkSettings,
    NetworkSettings__factory
  );

  static StandardStakingRewards = new BancorContract<StandardStakingRewards>(
    standardStakingRewards,
    StandardStakingRewards__factory
  );

  static PoolCollection = new BancorContract<PoolCollectionType1>(
    poolCollectionType1,
    PoolCollectionType1__factory
  );

  static PendingWithdrawals = new BancorContract<PendingWithdrawals>(
    pendingWithdrawals,
    PendingWithdrawals__factory
  );

  static Token = (tokenAddress: string) => {
    return new BancorContract<Token>(tokenAddress, Token__factory);
  };
}

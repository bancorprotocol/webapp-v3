import {
  Token,
  Token__factory,
  BancorNetworkV3,
  BancorNetworkV3__factory,
  BancorNetworkInfo,
  BancorNetworkInfo__factory,
  NetworkSettings,
  NetworkSettings__factory,
  StakingRewardsClaim,
  StakingRewardsClaim__factory,
  StandardRewards,
  StandardRewards__factory,
  PoolCollectionType1,
  PoolCollectionType1__factory,
  PendingWithdrawals,
  PendingWithdrawals__factory,
  BancorPortal,
  BancorPortal__factory,
  ExternalProtectionVault,
  ExternalProtectionVault__factory,
} from 'services/web3/abis/types';
import { web3, writeWeb3 } from 'services/web3/index';
import { providers } from 'ethers';
import bancorNetworkAddress from 'services/web3/abis/v3/BancorNetworkV3_Proxy.json';
import bancorNetworkInfoAddress from 'services/web3/abis/v3/BancorNetworkInfo_Proxy.json';
import networkSettingsAddress from 'services/web3/abis/v3/NetworkSettings_Proxy.json';
import pendingWithdrawalsAddress from 'services/web3/abis/v3/PendingWithdrawals_Proxy.json';
import poolCollectionType1Address from 'services/web3/abis/v3/PoolCollectionType1.json';
import stakingRewardsClaimAddress from 'services/web3/abis/StakingRewardsClaim.json';
import standardRewardsAddress from 'services/web3/abis/v3/StandardRewards_Proxy.json';
import bancorPortalAddress from 'services/web3/abis/v3/BancorPortal_Proxy.json';
import externalProtectionVaultAddress from 'services/web3/abis/v3/ExternalProtectionVault.json';

export class BancorContract<T> {
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
    bancorNetworkAddress.address,
    BancorNetworkV3__factory
  );

  static BancorNetworkInfo = new BancorContract<BancorNetworkInfo>(
    bancorNetworkInfoAddress.address,
    BancorNetworkInfo__factory
  );

  static NetworkSettings = new BancorContract<NetworkSettings>(
    networkSettingsAddress.address,
    NetworkSettings__factory
  );

  static StakingRewardsClaim = new BancorContract<StakingRewardsClaim>(
    stakingRewardsClaimAddress.address,
    StakingRewardsClaim__factory
  );

  static StandardRewards = new BancorContract<StandardRewards>(
    standardRewardsAddress.address,
    StandardRewards__factory
  );

  static PoolCollection = new BancorContract<PoolCollectionType1>(
    poolCollectionType1Address.address,
    PoolCollectionType1__factory
  );

  static PendingWithdrawals = new BancorContract<PendingWithdrawals>(
    pendingWithdrawalsAddress.address,
    PendingWithdrawals__factory
  );

  static BancorPortal = new BancorContract<BancorPortal>(
    bancorPortalAddress.address,
    BancorPortal__factory
  );

  static ExternalProtectionVault = new BancorContract<ExternalProtectionVault>(
    externalProtectionVaultAddress.address,
    ExternalProtectionVault__factory
  );

  static Token = (tokenAddress: string) => {
    return new BancorContract<Token>(tokenAddress, Token__factory);
  };
}

import {
  BancorNetworkV1,
  BancorNetworkV1__factory,
  BancorNetworkInfoV1,
  BancorNetworkInfoV1__factory,
  NetworkSettingsV1,
  NetworkSettingsV1__factory,
  StandardStakingRewardsV1,
  StandardStakingRewardsV1__factory,
} from 'services/web3/abis/types';
import { BancorV3Contract } from 'services/web3/v3/index';

const CONTRACT_ADDRESSES_V3 = {
  NetworkSettingsV1: '0x302979c8f478279Ab3F46Ce3Dc96c98d9c28fb0c',
  StandardStakingRewardsV1: '0x3c497b7086d91927a6EbaB57dDbE70dD54b30EA9',
  BancorNetworkV1: '0x093C761bd5B8f71d72cBC74A72cc9c6aEDC8EE49',
  BancorNetworkInfoV1: '0x6B0aF7Dc3cD9d4eAf6ecea4584F4177694eDC820',
};

export class ContractsApi {
  BancorNetworkV1 = new BancorV3Contract<BancorNetworkV1>(
    CONTRACT_ADDRESSES_V3.BancorNetworkV1,
    BancorNetworkV1__factory
  );

  BancorNetworkInfoV1 = new BancorV3Contract<BancorNetworkInfoV1>(
    CONTRACT_ADDRESSES_V3.BancorNetworkInfoV1,
    BancorNetworkInfoV1__factory
  );

  NetworkSettingsV1 = new BancorV3Contract<NetworkSettingsV1>(
    CONTRACT_ADDRESSES_V3.NetworkSettingsV1,
    NetworkSettingsV1__factory
  );

  StandardStakingRewardsV1 = new BancorV3Contract<StandardStakingRewardsV1>(
    CONTRACT_ADDRESSES_V3.StandardStakingRewardsV1,
    StandardStakingRewardsV1__factory
  );
}

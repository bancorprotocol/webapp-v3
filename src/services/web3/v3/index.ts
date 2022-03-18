import {
  BancorV3ContractBase,
  CONTRACT_ADDRESSES_V3,
} from 'services/web3/v3/config';
import {
  BancorNetworkV1,
  BancorNetworkV1__factory,
  NetworkSettingsV1,
  NetworkSettingsV1__factory,
  StandardStakingRewardsV1,
  StandardStakingRewardsV1__factory,
} from 'services/web3/abis/types';

class ContractsApi {
  BancorNetworkV1 = new BancorV3ContractBase<BancorNetworkV1>(
    CONTRACT_ADDRESSES_V3.BancorNetworkV1,
    BancorNetworkV1__factory
  );

  NetworkSettingsV1 = new BancorV3ContractBase<NetworkSettingsV1>(
    CONTRACT_ADDRESSES_V3.NetworkSettingsV1,
    NetworkSettingsV1__factory
  );

  StandardStakingRewardsV1 = new BancorV3ContractBase<StandardStakingRewardsV1>(
    CONTRACT_ADDRESSES_V3.StandardStakingRewardsV1,
    StandardStakingRewardsV1__factory
  );
}

export const contractsApi = new ContractsApi();

import { EthNetworks } from 'services/web3//types';
import { providers } from 'ethers';
import { isForkAvailable } from 'services/web3/config';
import { getTenderlyRpcLS } from 'utils/localStorage';

export const ALCHEMY_URL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_MAINNET}`;

export const web3 = {
  provider: providers.getDefaultProvider(1),
};

export const writeWeb3 = {
  signer: new providers.StaticJsonRpcProvider(ALCHEMY_URL).getSigner(),
};

export const getProvider = (
  network: EthNetworks = EthNetworks.Mainnet,
  useFork: boolean = isForkAvailable
): providers.BaseProvider => {
  return web3.provider;
};

export const setProvider = (provider: providers.BaseProvider) => {
  web3.provider = provider;
};

export const setSigner = (
  signer?: providers.JsonRpcSigner | null,
  account?: string | null
) => {
  if (account) {
    console.log('account', account);
    writeWeb3.signer = new providers.StaticJsonRpcProvider(
      getTenderlyRpcLS()
    ).getUncheckedSigner(account);
  } else if (signer) writeWeb3.signer = signer;
};

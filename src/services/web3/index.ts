import { Web3Provider } from '@ethersproject/providers';
import { EthNetworks } from 'services/web3//types';
import { providers } from 'ethers';
import { ALCHEMY_URL } from 'services/web3/wallet/connectors';
import { isForkAvailable } from 'services/web3/config';
import { getTenderlyRpcLS } from 'utils/localStorage';

export const getProvider = (
  network: EthNetworks = EthNetworks.Mainnet,
  useFork: boolean = isForkAvailable
): providers.BaseProvider => {
  if (useFork) {
    return new providers.StaticJsonRpcProvider({
      url: getTenderlyRpcLS(),
      skipFetchSetup: true,
    });
  }
  if (process.env.REACT_APP_ALCHEMY_MAINNET) {
    return new providers.StaticJsonRpcProvider({
      url: ALCHEMY_URL,
      skipFetchSetup: true,
    });
  }

  return providers.getDefaultProvider(network);
};

export const web3 = {
  provider: getProvider(),
};

export const writeWeb3 = {
  signer: window.ethereum
    ? new Web3Provider(window.ethereum).getSigner()
    : new providers.StaticJsonRpcProvider(ALCHEMY_URL).getSigner(),
};

export const setProvider = (provider: providers.BaseProvider) => {
  web3.provider = provider;
};

export const setSigner = (
  signer?: providers.JsonRpcSigner,
  account?: string | null
) => {
  if (account)
    writeWeb3.signer = new providers.StaticJsonRpcProvider(
      getTenderlyRpcLS()
    ).getUncheckedSigner(account);
  else if (signer) writeWeb3.signer = signer;
};

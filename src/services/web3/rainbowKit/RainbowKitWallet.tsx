import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ReactNode } from 'react';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { chains, provider } = configureChains(
  [chain.mainnet],
  getTenderlyRpcLS()
    ? [jsonRpcProvider({ rpc: () => ({ http: getTenderlyRpcLS() }) })]
    : [
        alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_MAINNET }),
        publicProvider(),
      ]
);

const { connectors } = getDefaultWallets({
  appName: 'Bancor',
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export const RainbowKitWallet = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};

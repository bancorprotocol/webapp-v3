import { useState } from 'react';
import { SUPPORTED_WALLETS } from 'web3/utils';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const WalletModal = () => {
  const { activate } = useWeb3React();
  const [pending, setPending] = useState<AbstractConnector | undefined>();
  const [error, setError] = useState<boolean>(false);

  const tryConnecting = async (connector: AbstractConnector | undefined) => {
    setPending(connector);

    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    )
      connector.walletConnectProvider = undefined;

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) activate(connector);
        else setError(true);
      });
  };

  return (
    <>
      {Object.keys(SUPPORTED_WALLETS).map((key) => {
        const option = SUPPORTED_WALLETS[key];
        return (
          <button key={key} onClick={() => tryConnecting(option.connector)}>
            <div>{option.name}</div>
          </button>
        );
      })}
    </>
  );
};

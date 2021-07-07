import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected, provider } from 'services/web3/wallet/connectors';
import { isAutoLogin, setAutoLogin } from 'utils/pureFunctions';
import { web3 } from 'services/web3/contracts';
import { EthNetworks } from '../types';
import Web3 from 'web3';

export const useAutoConnect = () => {
  const { activate, active } = useWeb3React();

  const [triedAutoLogin, setTriedAutoLogin] = useState(false);

  useEffect(() => {
    if (isAutoLogin())
      injected.isAuthorized().then((isAuthorized: boolean) => {
        if (isAuthorized) {
          activate(injected, undefined, true)
            .then(async () => {
              setAutoLogin(true);
              setTriedAutoLogin(true);
            })
            .catch(() => console.error('Failed to auto login'));
        }
      });

    setTriedAutoLogin(true);
  }, [activate]);

  useEffect(() => {
    if (!triedAutoLogin && active) {
      setTriedAutoLogin(true);
    }
  }, [triedAutoLogin, active]);

  return triedAutoLogin;
};

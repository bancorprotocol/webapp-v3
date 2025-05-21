import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { gnosisSafe, injected } from 'services/web3/wallet/connectors';
import { getAutoLoginLS, setAutoLoginLS } from 'utils/localStorage';
import { IS_IN_IFRAME } from 'utils/helperFunctions';
import { find } from 'lodash';
import { uauth } from './connectors';
import { SUPPORTED_WALLETS } from './utils';

export const useAutoConnect = () => {
  const { activate, active } = useWeb3React();

  const [triedAutoLogin, setTriedAutoLogin] = useState(false);

  useEffect(() => {
    if (IS_IN_IFRAME)
      gnosisSafe.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          activate(gnosisSafe, undefined, true).catch(() => {
            setTriedAutoLogin(true);
          });
        }
      });
    else if (getAutoLoginLS())
      injected.isAuthorized().then((isAuthorized: boolean) => {
        if (isAuthorized) {
          activate(injected, undefined, true)
            .then(async () => {
              setAutoLoginLS(true);
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

export const useUDName = (): string => {
  const { connector } = useWeb3React();
  const [udUserName, setUdUserName] = useState<string>('');
  const connectorName = find(SUPPORTED_WALLETS, ['connector', connector])?.name;

  useEffect(() => {
    const checkUDName = async () => {
      if (connectorName === 'Unstoppable Domains') {
        try {
          const udUser = await uauth.uauth.user();
          setUdUserName(udUser.sub);
        } catch (e) {
          console.error(e);
          setUdUserName('');
        }
      }
    };
    void checkUDName();

    return () => {
      setUdUserName('');
    };
  }, [connectorName]);

  return udUserName;
};

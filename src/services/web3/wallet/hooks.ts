import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected, gnosisSafe } from 'services/web3/wallet/connectors';
import { getAutoLoginLS, setAutoLoginLS } from 'utils/localStorage';
import { IS_IN_IFRAME } from 'utils/helperFunctions';

export const useAutoConnect = () => {
  const { activate, active } = useWeb3React();

  const [triedAutoLogin, setTriedAutoLogin] = useState(false);

  // if we're not in an iFrame we start with true and never make a redundant call
  const [triedSafe, setTriedSafe] = useState(!IS_IN_IFRAME);

  // first, try connecting to a gnosis safe
  useEffect(() => {
    if (!triedSafe) {
      gnosisSafe.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          activate(gnosisSafe, undefined, true).catch(() => {
            setTriedSafe(true);
            setTriedAutoLogin(true);
          });
        } else {
          setTriedSafe(true);
        }
      });
    }
  }, [activate, setTriedSafe]); // intentionally only running on mount

  // then, if that fails, try connecting to an injected connector
  useEffect(() => {
    if (triedSafe && getAutoLoginLS())
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

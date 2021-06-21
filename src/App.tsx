import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { Swap } from 'pages/Swap';
import { Loading } from 'pages/Loading';
import { NotFound } from 'pages/NotFound';
import { ButtonSamples } from 'pages/ButtonSamples';
import { UnsupportedNetwork } from 'pages/UnsupportedNetwork';
import { LayoutHeader } from 'elements/layoutHeader/LayoutHeader';
import { useAutoConnect } from 'web3/wallet/hooks';
import { isAutoLogin, isUnsupportedNetwork } from 'utils/pureFunctions';
import { setChainId, setUser } from 'observables/currentUser';
import { LayoutHeaderMobile } from 'elements/layoutHeaderMobile/LayoutHeaderMobile';
import { NotificationAlerts } from 'elements/notifications/NotificationAlerts';

export const App = () => {
  const { chainId, account } = useWeb3React();
  const [loading, setLoading] = useState(true);
  const unsupportedNetwork = isUnsupportedNetwork(chainId);
  const triedAutoLogin = useAutoConnect();

  useEffect(() => {
    if (chainId || triedAutoLogin || !isAutoLogin()) setLoading(false);
  }, [setLoading, chainId, triedAutoLogin]);

  useEffect(() => {
    setUser(account);
    setChainId(chainId);
  }, [account, chainId]);

  return (
    <BrowserRouter>
      <LayoutHeader />
      <LayoutHeaderMobile />
      {loading ? (
        <Loading />
      ) : unsupportedNetwork ? (
        <UnsupportedNetwork />
      ) : (
        <Switch>
          <Route exact strict path="/" component={Swap} />
          <Route exact strict path="/buttons" component={ButtonSamples} />
          <Route component={NotFound} />
        </Switch>
      )}
      <NotificationAlerts />
    </BrowserRouter>
  );
};

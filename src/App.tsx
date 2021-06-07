import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { Swap } from 'pages/Swap';
import { Loading } from 'pages/Loading';
import { NotFound } from 'pages/NotFound';
import { ButtonSamples } from 'pages/ButtonSamples';
import { UnsupportedNetwork } from 'pages/UnsupportedNetwork';
import { LayoutHeader } from 'elements/layoutHeader/LayoutHeader';
import { useAutoConnect } from 'web3/wallet/hooks';
import { fetchWelcomeData } from 'redux/bancorAPI/bancorAPI';
import { isAutoLogin, isUnsupportedNetwork } from 'utils/pureFunctions';

export const App = () => {
  const dispatch = useDispatch();
  const { chainId } = useWeb3React();
  const [loading, setLoading] = useState(true);
  const unsupportedNetwork = isUnsupportedNetwork(chainId);
  const triedAutoLogin = useAutoConnect();

  useEffect(() => {
    dispatch(fetchWelcomeData());
  }, [dispatch]);

  useEffect(() => {
    if (chainId || triedAutoLogin || !isAutoLogin()) setLoading(false);
  }, [setLoading, chainId, isAutoLogin]);

  return (
    <BrowserRouter>
      <LayoutHeader />
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
    </BrowserRouter>
  );
};

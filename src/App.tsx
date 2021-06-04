import { NotFound } from 'pages/NotFound';
import { Swap } from 'pages/Swap';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ButtonSamples } from 'pages/ButtonSamples';
import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchWelcomeData } from 'redux/bancorAPI/bancorAPI';
import { LayoutHeader } from './elements/layoutHeader/LayoutHeader';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWelcomeData());
  }, [dispatch]);

  const [walletOpen, setWalletOpen] = useState(false);
  const { account, deactivate } = useWeb3React();

  return (
    <BrowserRouter>
      {account ? (
        <div>
          <div>{account}</div>
          <button onClick={() => deactivate()}>Logout</button>
        </div>
      ) : (
        <button onClick={() => setWalletOpen(true)}>Connect a wallet</button>
      )}
      <LayoutHeader />
      <Switch>
        <Route exact strict path="/" component={Swap} />
        <Route exact strict path="/buttons" component={ButtonSamples} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

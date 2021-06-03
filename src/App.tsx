import { NotFound } from 'pages/NotFound';
import { Swap } from 'pages/Swap';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ButtonSamples } from 'pages/ButtonSamples';
import { useState } from 'react';
import { WalletModal } from 'elements/walletModal/WalletModal';
import { useWeb3React } from '@web3-react/core';

export const App = () => {
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
      <WalletModal isOpen={walletOpen} setIsOpen={setWalletOpen} />
      <Switch>
        <Route exact strict path="/" component={Swap} />
        <Route exact strict path="/buttons" component={ButtonSamples} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

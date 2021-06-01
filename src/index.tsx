import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'redux/index';
import reportWebVitals from 'reportWebVitals';
import 'styles/index.css';

import { getLibrary } from 'web3/utils';
import { Web3ReactProvider } from '@web3-react/core';

ReactDOM.render(
  <Provider store={store}>
    <Web3ReactProvider getLibrary={getLibrary}>
      <StrictMode>
        <App />
      </StrictMode>
    </Web3ReactProvider>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();

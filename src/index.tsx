import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'store';
import reportWebVitals from 'reportWebVitals';
import { I18nProvider } from 'i18n/i18nProvider';
import { getLibrary } from 'services/web3/wallet/utils';
import { Web3ReactProvider } from '@web3-react/core';
import 'styles/index.css';

const appContainer = document.getElementById('root');
const appElement = (
  <Provider store={store}>
    <I18nProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <StrictMode>
          <App />
        </StrictMode>
      </Web3ReactProvider>
    </I18nProvider>
  </Provider>
);
const appRoot = createRoot(appContainer!);

appRoot.render(appElement);

reportWebVitals();

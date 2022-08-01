import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'store';
import reportWebVitals from 'reportWebVitals';
import { I18nProvider } from 'i18n/i18nProvider';
import { getLibrary } from 'services/web3/wallet/utils';
import { Web3ReactProvider } from '@web3-react/core';
import 'styles/index.css';
import { QueryClientProvider } from 'queries';
import { SentryErrorBoundary } from 'sentry/ErrorBoundary';

ReactDOM.render(
  <SentryErrorBoundary>
    <QueryClientProvider>
      <Provider store={store}>
        <I18nProvider>
          <Web3ReactProvider getLibrary={getLibrary}>
            <StrictMode>
              <App />
            </StrictMode>
          </Web3ReactProvider>
        </I18nProvider>
      </Provider>
    </QueryClientProvider>
  </SentryErrorBoundary>,
  document.getElementById('root')
);

reportWebVitals();

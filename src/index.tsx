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
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://115b6423a34b41b7815a4256cf99dc32@o1317972.ingest.sentry.io/6571500',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 60000,
      staleTime: 30000,
      useErrorBoundary: true,
      // cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});
//
// const localStoragePersister = createWebStoragePersister({
//   key: 'bancor-test-local',
//   storage: window.localStorage,
// });
//
// persistQueryClient({
//   queryClient,
//   persister: localStoragePersister,
// });

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <I18nProvider>
        <Web3ReactProvider getLibrary={getLibrary}>
          <StrictMode>
            <App />
          </StrictMode>
        </Web3ReactProvider>
      </I18nProvider>
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
  document.getElementById('root')
);

reportWebVitals();

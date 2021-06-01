import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'redux/index';
import reportWebVitals from 'reportWebVitals';
import { IntlProvider } from 'react-intl';
import { messages, locale } from 'i18n';
import { getLibrary } from 'web3/utils';
import { Web3ReactProvider } from '@web3-react/core';
import 'styles/index.css';

ReactDOM.render(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      <Web3ReactProvider getLibrary={getLibrary}>
        <StrictMode>
          <App />
        </StrictMode>
      </Web3ReactProvider>
    </IntlProvider>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();

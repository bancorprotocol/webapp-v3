import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'redux/index';
import reportWebVitals from 'reportWebVitals';
import { IntlProvider } from 'react-intl';
import { messages, locale } from 'i18n';
import './styles/index.css';

ReactDOM.render(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      <StrictMode>
        <App />
      </StrictMode>
    </IntlProvider>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();

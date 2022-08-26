import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'store';
import reportWebVitals from 'reportWebVitals';
import { I18nProvider } from 'i18n/i18nProvider';
import 'styles/index.css';
import { RainbowKitWallet } from 'services/web3/rainbowKit/RainbowKitWallet';

ReactDOM.render(
  <Provider store={store}>
    <I18nProvider>
      <RainbowKitWallet>
        <StrictMode>
          <App />
        </StrictMode>
      </RainbowKitWallet>
    </I18nProvider>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'App';
import { store } from 'redux/index';
import reportWebVitals from 'reportWebVitals';
import 'styles/index.css';

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();

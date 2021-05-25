import { StrictMode } from "react";
import ReactDOM from "react-dom";
import 'styles/index.css';
import { App } from "App";
import reportWebVitals from "reportWebVitals";

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);

reportWebVitals();

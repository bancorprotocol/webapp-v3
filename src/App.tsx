import { NotFound } from 'pages/NotFound';
import { Swap } from 'pages/Swap';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact strict path="/" component={Swap} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

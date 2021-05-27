import { NotFound } from "pages/NotFound";
import { Swap } from "pages/Swap";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ButtonSamples } from './pages/ButtonSamples';

export const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact strict path="/" component={Swap} />
        <Route exact strict path="/buttons" component={ButtonSamples} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

import { NotFound } from 'pages/NotFound';
import { Swap } from 'pages/Swap';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ButtonSamples } from 'pages/ButtonSamples';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchWelcomeData } from 'redux/bancorAPI/bancorAPI';
import { LayoutHeader } from './elements/layoutHeader/LayoutHeader';
import { trigger } from 'observables/pools';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    trigger();
    dispatch(fetchWelcomeData());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <LayoutHeader />
      <Switch>
        <Route exact strict path="/" component={Swap} />
        <Route exact strict path="/buttons" component={ButtonSamples} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

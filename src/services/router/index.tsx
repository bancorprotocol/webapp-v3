import { RouteObject, useNavigate, useRoutes } from 'react-router-dom';
import { useRoutesTrade } from 'services/router/trade.routes';
import { useRoutesPortfolio } from 'services/router/portfolio.routes';
import { useRoutesMain } from 'services/router/main.routes';
import { GoToPage } from 'services/router/goToPage.service';

export interface PageTradeQuery {
  from?: string | null;
  to?: string | null;
  limit?: boolean | null;
}

export const useNavigation = () => {
  const goToPage = new GoToPage(useNavigate());

  return { goToPage };
};

export const BancorRouter = () => {
  const routes: RouteObject[] = [
    ...useRoutesTrade(),
    ...useRoutesPortfolio(),
    ...useRoutesMain(),
  ];

  const element = useRoutes(routes);
  return <>{element}</>;
};

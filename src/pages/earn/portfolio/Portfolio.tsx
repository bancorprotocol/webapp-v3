import { Page } from 'components/Page';
import { Outlet } from 'react-router-dom';
import { BancorRoutes } from 'router/routes.service';
import { PageNavLink } from 'components/pageNavLink/PageNavLink';

export const Portfolio = () => {
  const title = 'Portfolio';

  return (
    <Page
      title={title}
      trailingTitle={
        <div className="flex items-center space-x-10">
          <PageNavLink to={BancorRoutes.portfolio}>V3</PageNavLink>
          <PageNavLink to={BancorRoutes.portfolioV2}>V2</PageNavLink>
          <PageNavLink to={BancorRoutes.portfolioV1}>V1</PageNavLink>
        </div>
      }
    >
      <div className="mt-40">
        <Outlet />
      </div>
    </Page>
  );
};

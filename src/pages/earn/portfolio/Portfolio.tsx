import { Page } from 'components/Page';
import { Outlet } from 'react-router-dom';
import { BancorURL } from 'router/bancorURL.service';
import { PageNavLink } from 'components/pageNavLink/PageNavLink';
import { useAppSelector } from 'store/index';

export const Portfolio = () => {
  const v1 = useAppSelector((state) => state.liquidity.poolTokens);

  const v2 = useAppSelector((state) => state.liquidity.protectedPositions);

  const title = 'Portfolio';

  return (
    <Page
      title={title}
      trailingTitle={
        <div className="flex items-center space-x-10">
          <PageNavLink to={BancorURL.portfolio}>V3</PageNavLink>
          {v2.length > 0 && (
            <PageNavLink to={BancorURL.portfolioV2}>
              <div className="flex space-x-5">
                <div>V2</div>
                <div className="bg-primary rounded-full w-6 h-6" />
              </div>
            </PageNavLink>
          )}
          {v1.length > 0 && (
            <PageNavLink to={BancorURL.portfolioV1}>
              <div className="flex space-x-5">
                <div>V1</div>
                <div className="bg-primary rounded-full w-6 h-6" />
              </div>
            </PageNavLink>
          )}
        </div>
      }
    >
      <div className="mt-40">
        <Outlet />
      </div>
    </Page>
  );
};

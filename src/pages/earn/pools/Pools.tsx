import { Page } from 'components/Page';
import { PageNavLink } from 'components/pageNavLink/PageNavLink';
import { BancorRoutes } from 'router/routes.service';
import { Outlet } from 'react-router-dom';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';

export const Pools = () => {
  const title = 'Earn';
  const subtitle =
    'Your tokens were never exposed to Impermanent Loss during the cooldown period. Whether or not you withdraw, you’re always fully protected.';

  return (
    <Page
      title={title}
      subtitle={subtitle}
      trailingSubtitle={
        <a
          href="https://newsletter.banklesshq.com/p/how-to-protect-yourself-from-impermanent"
          className="hover:underline text-primary"
          target="_blank"
          rel="noreferrer"
        >
          Learn More
        </a>
      }
      trailingTitle={
        <div className="flex items-center space-x-10">
          <PageNavLink to={BancorRoutes.earn}>
            <IconProtected className="text-primary" />
            V3
          </PageNavLink>
          <PageNavLink to={BancorRoutes.earnV2}>V2</PageNavLink>
        </div>
      }
    >
      <Outlet />
    </Page>
  );
};

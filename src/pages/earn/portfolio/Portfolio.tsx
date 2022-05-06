import { Page } from 'components/Page';
import {
  Link,
  LinkProps,
  Outlet,
  useMatch,
  useResolvedPath,
} from 'react-router-dom';
import { BancorRoutes } from 'services/router/routes.service';
import { classNameGenerator } from 'utils/pureFunctions';

export const PageNavLink = ({ children, to, ...props }: LinkProps) => {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  const getTabBtnClasses = (selected: boolean, hidden?: boolean) =>
    classNameGenerator({
      'px-10 py-5 rounded-10': true,
      'bg-white dark:bg-charcoal': selected,
      hidden: hidden,
    });

  return (
    <Link
      to={to}
      {...props}
      className={`flex items-center gap-4 ${getTabBtnClasses(!!match)}`}
    >
      {children}
    </Link>
  );
};

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

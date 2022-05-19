import { Page } from 'components/Page';
import { PageNavLink } from 'components/pageNavLink/PageNavLink';
import { BancorURL } from 'router/bancorURL.service';
import { Outlet } from 'react-router-dom';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { Tooltip } from 'components/tooltip/Tooltip';

export const Pools = () => {
  const title = 'Earn';
  const subtitle =
    'Deposit a single token and maintain 100% upside exposure while earning fees and rewards.';

  return (
    <Page
      title={title}
      subtitle={subtitle}
      trailingTitle={
        <div className="flex items-center space-x-10 text-16">
          <PageNavLink to={BancorURL.earn}>
            <Tooltip
              content={
                <>
                  "All V3 tokens are eligible for Single-Sided Staking and 100%
                  Instant Impermanent Loss Protection.{' '}
                  <a
                    href="https://support.bancor.network/hc/en-us/articles/5478576660242-What-is-a-whitelisted-pool"
                    className="hover:underline text-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read more
                  </a>
                </>
              }
              button={<IconProtected className="text-primary" />}
            />
            V3
          </PageNavLink>
          <PageNavLink to={BancorURL.earnV2}>
            <Tooltip
              content="In Bancor V2, only tokens with a “shield” icon offer Single-Sided Staking and Impermanent Loss Protection."
              button={<div className="px-6">V2</div>}
            />
          </PageNavLink>
        </div>
      }
    >
      <Outlet />
    </Page>
  );
};

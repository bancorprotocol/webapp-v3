import { Page } from 'components/Page';
import { PageNavLink } from 'components/pageNavLink/PageNavLink';
import { BancorURL } from 'router/bancorURL.service';
import { Outlet } from 'react-router-dom';
import { getV2V3 } from 'services/api/googleTagManager';
import { sendPoolEvent, PoolEvent } from 'services/api/googleTagManager/pool';
//import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
//import { openNewTab } from 'utils/pureFunctions';

export const Pools = () => {
  const title = 'Pools';
  const subtitle =
    'The only DeFi staking protocol with Single-Sided Liquidity.';

  return (
    <Page
      title={title}
      subtitle={subtitle}
      trailingTitle={
        <div className="flex items-center space-x-10 text-16">
          <PageNavLink
            to={BancorURL.earn}
            onClick={() =>
              sendPoolEvent(PoolEvent.VersionSwitch, {
                bancor_version_selection: getV2V3(true),
              })
            }
          >
            {/* <PopoverV3
              buttonElement={() => <IconProtected className="text-primary" />}
            >
              <>
                <div>
                  All V3 tokens are eligible for Single-Sided Staking and 100%
                  Instant Impermanent Loss Protection.{' '}
                </div>
                <div
                  onClick={() =>
                    openNewTab(
                      'https://support.bancor.network/hc/en-us/articles/5478576660242-What-is-a-whitelisted-pool'
                    )
                  }
                  className="cursor-pointer hover:underline text-primary"
                >
                  Read more
                </div>
              </>
            </PopoverV3> */}
            V3
          </PageNavLink>
          <PageNavLink
            to={BancorURL.earnV2}
            onClick={() =>
              sendPoolEvent(PoolEvent.VersionSwitch, {
                bancor_version_selection: getV2V3(false),
              })
            }
          >
            V2
          </PageNavLink>
        </div>
      }
    >
      <Outlet />
    </Page>
  );
};

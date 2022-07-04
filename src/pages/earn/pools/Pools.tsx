import { Page } from 'components/Page';
import { PageNavLink } from 'components/pageNavLink/PageNavLink';
import { BancorURL } from 'router/bancorURL.service';
import { Outlet } from 'react-router-dom';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { PoolEvent, sendPoolEvent } from 'services/api/googleTagManager/pool';
import { getV2V3 } from 'services/api/googleTagManager';
//import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
//import { openNewTab } from 'utils/pureFunctions';

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
          <PageNavLink
            to={BancorURL.earn}
            onClick={() =>
              sendPoolEvent(PoolEvent.PoolClick, {
                pools_bancor_version_selection: getV2V3(false),
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
                  className="hover:underline text-primary cursor-pointer"
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
              sendPoolEvent(PoolEvent.PoolClick, {
                pools_bancor_version_selection: getV2V3(true),
              })
            }
          >
            <PopoverV3
              children="In Bancor V2, only tokens with a “shield” icon offer Single-Sided Staking and Impermanent Loss Protection."
              buttonElement={() => <div className="px-6">V2</div>}
            />
          </PageNavLink>
        </div>
      }
    >
      <Outlet />
    </Page>
  );
};

import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { useAppSelector } from 'store';
import V3Portfolio from 'elements/earn/portfolio/v3/V3Portfolio';
import { Tab } from '@headlessui/react';
import { classNameGenerator } from 'utils/pureFunctions';
import { PoolToken } from 'services/observables/pools';
import { ProtectedPosition } from 'services/web3/protection/positions';
import { Page } from 'components/Page';

export const Portfolio = () => {
  const v2 = useAppSelector<ProtectedPosition[]>(
    (state) => state.liquidity.protectedPositions
  );
  const v1 = useAppSelector<PoolToken[]>((state) => state.liquidity.poolTokens);

  const getTabBtnClasses = (selected: boolean, hidden?: boolean) =>
    classNameGenerator({
      'px-10 py-5 rounded-10': true,
      'bg-white dark:bg-charcoal': selected,
      hidden: hidden,
    });

  const title = 'Portfolio';

  return (
    <Page title={title}>
      <Tab.Group>
        <div className="flex items-center mb-30">
          <Tab.List className="space-x-10 ml-[180px] mt-[-25px]">
            <Tab className={({ selected }) => getTabBtnClasses(selected)}>
              V3
            </Tab>

            <Tab
              className={({ selected }) =>
                getTabBtnClasses(selected, !v2.length)
              }
            >
              <div className="flex space-x-5">
                <div>V2</div>
                <div className="bg-primary rounded-full w-6 h-6" />
              </div>
            </Tab>

            <Tab
              className={({ selected }) =>
                getTabBtnClasses(selected, !v1.length)
              }
            >
              <div className="flex space-x-5">
                <div>V1</div>
                <div className="bg-primary rounded-full w-6 h-6" />
              </div>
            </Tab>
          </Tab.List>
        </div>

        <Tab.Panels>
          <Tab.Panel>
            <V3Portfolio />
          </Tab.Panel>

          <Tab.Panel>
            <LiquidityProtection />
          </Tab.Panel>

          <Tab.Panel>
            <PoolTokens />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Page>
  );
};

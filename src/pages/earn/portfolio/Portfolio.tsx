import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { useAppSelector } from 'store';
import V3Portfolio from 'elements/earn/portfolio/v3/V3Portfolio';
import { Tab } from '@headlessui/react';
import { classNameGenerator } from 'utils/pureFunctions';

export const Portfolio = () => {
  const v2 = useAppSelector((state) => state.liquidity.protectedPositions);
  const v1 = useAppSelector((state) => state.liquidity.poolTokens);

  const getTabBtnClasses = (selected: boolean, hidden?: boolean) =>
    classNameGenerator({
      'px-10 py-5 rounded-10': true,
      'bg-white dark:bg-charcoal': selected,
      hidden: hidden,
    });

  return (
    <div className="max-w-[1140px] mx-auto md:bg-fog md:dark:bg-black">
      <Tab.Group>
        <div className="flex items-center mb-30 pt-30">
          <h1 className="md:text-[30px] font-semibold pl-10 md:pl-0">
            Portfolio
          </h1>
          <Tab.List className="space-x-10 ml-20">
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
    </div>
  );
};

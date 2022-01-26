import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { useState } from 'react';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { classNameGenerator } from 'utils/pureFunctions';
import { useAppSelector } from 'redux/index';
import { PoolToken } from 'services/observables/tokens';
import { V3Portfolio } from 'elements/earn/portfolio/v3/V3Portfolio';

export const Portfolio = () => {
  const [selectedTab, setSelectedTab] = useState<'v3' | 'v2' | 'v1'>('v3');
  const poolTokens = useAppSelector<PoolToken[]>(
    (state) => state.liquidity.poolTokens
  );

  return (
    <div className="max-w-[1140px] mx-auto bg-fog dark:bg-black">
      <div className="flex items-center my-20">
        <h1 className="text-[30px] font-semibold pl-10 md:pl-0">Portfolio</h1>
        <div className="text-16 ml-20 space-x-20">
          <button
            onClick={() => setSelectedTab('v3')}
            className={`px-10 py-5 ${classNameGenerator({
              'font-semibold rounded-10 bg-white': selectedTab === 'v3',
              'font-light': selectedTab !== 'v3',
            })}`}
          >
            V3
          </button>
          <button
            onClick={() => setSelectedTab('v2')}
            className={`pb-4 w-[170px] text-left ${classNameGenerator({
              'font-semibold rounded-10 bg-white': selectedTab === 'v2',
              'font-light': selectedTab !== 'v2',
            })}`}
          >
            V2
          </button>
          {!!poolTokens.length && (
            <button
              onClick={() => setSelectedTab('v1')}
              className={`pb-4 w-[110px] text-right ${classNameGenerator({
                'font-semibold rounded-10 bg-white': selectedTab === 'v1',
                'font-light': selectedTab !== 'v1',
              })}`}
            >
              V1
            </button>
          )}
        </div>
      </div>

      {selectedTab === 'v3' && <V3Portfolio />}
      {selectedTab === 'v2' && <LiquidityProtection />}
      {selectedTab === 'v1' && <PoolTokens />}
    </div>
  );
};

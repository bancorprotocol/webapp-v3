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
      <h1 className="pt-10 text-[30px] font-semibold pl-10 md:pl-0">
        Portfolio
      </h1>
      <div className="text-16 my-20 pl-10 md:pl-0">
        <button
          onClick={() => setSelectedTab('v3')}
          className={`pb-4 w-[170px] text-left ${classNameGenerator({
            'font-semibold border-b-2 border-primary': selectedTab === 'v3',
            'font-light border-b border-graphite': selectedTab !== 'v3',
          })}`}
        >
          Liquidity Protection
        </button>
        <button
          onClick={() => setSelectedTab('v2')}
          className={`pb-4 w-[170px] text-left ${classNameGenerator({
            'font-semibold border-b-2 border-primary': selectedTab === 'v2',
            'font-light border-b border-graphite': selectedTab !== 'v2',
          })}`}
        >
          Liquidity Protection
        </button>
        {!!poolTokens.length && (
          <button
            onClick={() => setSelectedTab('v1')}
            className={`pb-4 w-[110px] text-right ${classNameGenerator({
              'font-semibold border-b-2 border-primary': selectedTab === 'v1',
              'font-light border-b border-graphite': selectedTab !== 'v1',
            })}`}
          >
            Pool Tokens
          </button>
        )}
      </div>
      {selectedTab === 'v3' && <V3Portfolio />}
      {selectedTab === 'v2' && <LiquidityProtection />}
      {selectedTab === 'v1' && <PoolTokens />}
    </div>
  );
};

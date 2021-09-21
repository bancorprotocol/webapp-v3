import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { useState } from 'react';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { classNameGenerator } from 'utils/pureFunctions';

export const Portfolio = () => {
  const [selectedTab, setSelectedTab] = useState<'protection' | 'pooltokens'>(
    'protection'
  );
  return (
    <div className="max-w-[1140px] mx-auto bg-grey-1 dark:bg-blue-3">
      <h1 className="text-[30px] font-semibold">Portfolio</h1>
      <div className="text-16 my-20">
        <button
          onClick={() => setSelectedTab('protection')}
          className={`pb-4 w-[170px] text-left ${classNameGenerator({
            'font-semibold border-b-2 border-primary':
              selectedTab === 'protection',
            'font-light border-b border-grey-3': selectedTab !== 'protection',
          })}`}
        >
          Liquidity Protection
        </button>
        <button
          onClick={() => setSelectedTab('pooltokens')}
          className={`pb-4 w-[110px] text-right ${classNameGenerator({
            'font-semibold border-b-2 border-primary':
              selectedTab === 'pooltokens',
            'font-light border-b border-grey-3': selectedTab !== 'pooltokens',
          })}`}
        >
          Pool Tokens
        </button>
      </div>
      {selectedTab === 'protection' && <LiquidityProtection />}
      {selectedTab === 'pooltokens' && <PoolTokens />}
    </div>
  );
};

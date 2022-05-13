import { useAppSelector } from 'store/index';
import {
  getIsLoadingHoldings,
  getPortfolioHoldings,
} from 'store/portfolio/v3Portfolio';
import { useState } from 'react';

import { V3HoldingsItem } from 'elements/earn/portfolio/v3/holdings/V3HoldingsItem';

export const V3Holdings = () => {
  const [selectedId, setSelectedId] = useState('');
  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);

  return (
    <div>
      <h2>Holdings</h2>

      <div className="space-y-10 mt-20">
        {!isLoadingHoldings
          ? holdings.map((holding) => (
              <V3HoldingsItem
                key={holding.pool.poolDltId}
                holding={holding}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
              />
            ))
          : [...Array(3)].map((_, i) => (
              <div key={i} className="loading-skeleton h-80"></div>
            ))}
      </div>
    </div>
  );
};

import { SwapWidget } from 'elements/swapWidget/SwapWidget';
import { useState } from 'react';
import { useSwapLimitTable } from 'elements/swapLimit/SwapLimitTable';
import { useQuery } from 'hooks/useQuery';

export const Swap = () => {
  const [isLimit, setIsLimit] = useState(false);
  const [SwapLimitTable, refreshLimit] = useSwapLimitTable();
  const query = useQuery();

  return (
    <div className="pt-60 md:pt-[120px]">
      <SwapWidget
        isLimit={isLimit}
        setIsLimit={setIsLimit}
        from={query.get('from')}
        to={query.get('to')}
        limit={query.get('limit')}
        refreshLimit={refreshLimit}
      />
      {isLimit && SwapLimitTable ? SwapLimitTable : ''}
    </div>
  );
};

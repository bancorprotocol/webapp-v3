import { useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';

export const SwapWidget = () => {
  const [isLimit, setIsLimit] = useState(false);
  const [isUsd, setIsUsd] = useState(false);

  return (
    <div className="widget mx-auto">
      <SwapHeader
        isLimit={isLimit}
        setIsLimit={setIsLimit}
        isUsd={isUsd}
        setIsUsd={setIsUsd}
      />
      <hr className="widget-separator" />
      {isLimit ? <SwapLimit /> : <SwapMarket />}
    </div>
  );
};

import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { useState } from 'react';

export const SwapWidget = () => {
  const [isLimit, setIsLimit] = useState(false);

  return (
    <div className="widget mx-auto">
      <SwapHeader isLimit={isLimit} setIsLimit={setIsLimit} />
      <hr className="widget-separator" />
      {isLimit ? <SwapLimit /> : <SwapMarket />}
      {/* <div className="px-20">
        <TokenInputField
          label="You Pay"
          balance={123.4567}
          balanceUsd={98.76}
          bgGrey
        />
      </div>

      <div className="widget-block mt-20">
        <div className="mx-10 mb-16">
          <TokenInputField
            label="You Receive"
            balance={123.4567}
            balanceUsd={98.76}
          />

          <div className="flex justify-between mt-15">
            <span>Rate</span>
            <span>1 BNT = 0.00155432 ETH</span>
          </div>

          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>0.2000%</span>
          </div>
        </div>

        <button className="btn-primary rounded w-full">Swap</button>
      </div>*/}
    </div>
  );
};

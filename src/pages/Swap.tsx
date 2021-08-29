import { SwapWidget } from 'elements/swapWidget/SwapWidget';
import { useState } from 'react';
import { SwapLimitTable } from 'elements/swapLimit/SwapLimitTable';
import { RouteComponentProps } from 'react-router-dom';

export const Swap = (
  props: RouteComponentProps<{ from: string; to: string }>
) => {
  const [isLimit, setIsLimit] = useState(false);

  return (
    <div className="md:pt-[55px]">
      <SwapWidget
        isLimit={isLimit}
        setIsLimit={setIsLimit}
        from={props.match.params.from}
        to={props.match.params.to}
      />
      {isLimit ? <SwapLimitTable /> : ''}
    </div>
  );
};

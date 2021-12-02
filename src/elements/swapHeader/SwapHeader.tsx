import { classNameGenerator } from 'utils/pureFunctions';
import 'elements/swapHeader/SwapHeader.css';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';

interface SwapHeaderProps {
  isLimit: boolean;
  setIsLimit: Function;
}

export enum TEST_IDS {
  MarketButton = 'market-button',
  LimitButton ='limit-button'
};

export const SwapHeader = ({ isLimit, setIsLimit }: SwapHeaderProps) => {
  const marketActive = classNameGenerator({
    'swap-header-active': !isLimit,
  });

  const limitActive = classNameGenerator({
    'swap-header-active': isLimit,
  });

  return (
    <div>
      <div className="swap-header">
        <div>
          <button
            className={marketActive}
            onClick={() => setIsLimit(false)}
            data-testId={TEST_IDS.MarketButton}
          >
            Market
          </button>
          <span className="mx-12">|</span>
          <button
            className={limitActive}
            onClick={() => setIsLimit(true)}
            data-testId={TEST_IDS.LimitButton}
          >
            Limit
          </button>
        </div>

        <SwapSwitch />
      </div>
    </div>
  );
};

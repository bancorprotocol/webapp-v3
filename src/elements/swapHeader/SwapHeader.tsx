import { classNameGenerator } from 'utils/pureFunctions';
import 'elements/swapHeader/SwapHeader.css';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';

interface SwapHeaderProps {
  isLimit: boolean;
  setIsLimit: Function;
  setToggle: Function;
}

export const SwapHeader = ({
  isLimit,
  setIsLimit,
  setToggle,
}: SwapHeaderProps) => {
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
          <button className={marketActive} onClick={() => setIsLimit(false)}>
            Market
          </button>
          <span className="ml-18 mr-10">|</span>
          <button className={limitActive} onClick={() => setIsLimit(true)}>
            Limit
          </button>
        </div>

        <SwapSwitch setIsEnabled={setToggle} />
      </div>
    </div>
  );
};

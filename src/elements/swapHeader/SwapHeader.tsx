import { classNameGenerator } from 'utils/pureFunctions';
import 'elements/swapHeader/SwapHeader.css';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconSettings } from 'assets/icons/settings.svg';
import { SlippageSettings } from 'elements/settings/SlippageSettings';

interface SwapHeaderProps {
  isLimit: boolean;
  setIsLimit: Function;
}

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
            className={`${marketActive}`}
            onClick={() => setIsLimit(false)}
          >
            Market
          </button>
          <span className="border-r b-silver mx-12" />
          <button className={limitActive} onClick={() => setIsLimit(true)}>
            Limit
          </button>
        </div>

        <div className={'flex items-center space-x-20'}>
          <PopoverV3
            buttonElement={() => (
              <IconSettings className={'w-24 cursor-pointer'} />
            )}
          >
            <SlippageSettings />
          </PopoverV3>
          <SwapSwitch />
        </div>
      </div>
    </div>
  );
};

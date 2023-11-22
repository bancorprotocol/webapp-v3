import 'elements/swapHeader/SwapHeader.css';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconSettings } from 'assets/icons/settings.svg';
import { SlippageSettings } from 'elements/settings/SlippageSettings';

export const SwapHeader = () => {
  return (
    <div>
      <div className="swap-header">
        <div>
          <span className={'swap-header-active'}>Market</span>
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

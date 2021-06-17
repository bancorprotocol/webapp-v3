import { Switch } from '@headlessui/react';
import { ReactComponent as IconCoins } from 'assets/icons/coins.svg';
import 'elements/swapSwitch/SwapSwitch.css';

interface SwapSwitchProps {
  isEnabled: boolean;
  setIsEnabled: Function;
}

export const SwapSwitch = ({ isEnabled, setIsEnabled }: SwapSwitchProps) => {
  const switchStyles = `swap-switch !min-w-[0px] ${
    isEnabled
      ? 'bg-primary border-primary dark:bg-primary-light dark:border-primary-light'
      : 'bg-blue-1 border-blue-1 dark:bg-grey-3 dark:border-grey-3'
  }`;

  const switchToggleStyles = `swap-switch-toggle ${
    isEnabled ? 'translate-x-14' : 'translate-x-0'
  }`;

  const coinIconStyles = isEnabled
    ? 'text-grey-4'
    : 'text-blue-4 dark:text-grey-3';

  const dollarIconStyles = isEnabled
    ? 'text-primary dark:text-primary-light'
    : 'dark:text-grey-4';

  return (
    <div className="flex  items-center space-x-4 text-14">
      <IconCoins className={`w-[13px] ${coinIconStyles}`} />

      <Switch
        checked={isEnabled}
        onChange={() => setIsEnabled(!isEnabled)}
        className={switchStyles}
      >
        <span className="sr-only">Toggle USD Switch</span>
        <span aria-hidden="true" className={switchToggleStyles} />
      </Switch>

      <div className={dollarIconStyles}>$</div>
    </div>
  );
};

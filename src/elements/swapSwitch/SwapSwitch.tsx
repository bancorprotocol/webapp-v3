import { Switch } from '@headlessui/react';
import { ReactComponent as IconCoins } from 'assets/icons/coins.svg';
import { ReactComponent as IconDollar } from 'assets/icons/dollar.svg';
import 'elements/swapSwitch/SwapSwitch.css';
import { useAppSelector } from 'redux/index';
import { useDispatch } from 'react-redux';
import { setUsdToggle } from 'redux/user/user';

export const SwapSwitch = () => {
  const dispatch = useDispatch();
  const isEnabled = useAppSelector<boolean>((state) => state.user.usdToggle);
  const setIsEnabled = (state: boolean) => {
    dispatch(setUsdToggle(state));
  };

  const switchStyles = `swap-switch !min-w-[0px] ${
    isEnabled
      ? 'bg-primary border-primary dark:bg-primary-light dark:border-primary-light'
      : 'bg-blue-1 border-blue-1 dark:bg-grey-3 dark:border-grey-3'
  }`;

  const switchToggleStyles = `swap-switch-toggle ${
    isEnabled ? 'md:translate-x-12 translate-x-20' : 'translate-x-0'
  }`;

  const coinIconStyles = isEnabled
    ? 'text-grey-4'
    : 'text-blue-4 dark:text-grey-3';

  const dollarIconStyles = isEnabled
    ? 'text-primary dark:text-primary-light'
    : 'dark:text-grey-4';

  return (
    <div className="flex items-center space-x-4 text-14">
      <IconCoins className={`md:w-[13px] w-[20px] ${coinIconStyles}`} />
      <Switch
        checked={isEnabled}
        onChange={() => setIsEnabled(!isEnabled)}
        className={switchStyles}
      >
        <span className="sr-only">Toggle USD Switch</span>
        <span aria-hidden="true" className={switchToggleStyles} />
      </Switch>

      <IconDollar
        className={`md:w-[9px] w-[14px] h-[23px] ${dollarIconStyles}`}
      />
    </div>
  );
};

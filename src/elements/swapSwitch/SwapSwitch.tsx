import { ReactComponent as IconCoins } from 'assets/icons/coins.svg';
import { ReactComponent as IconDollar } from 'assets/icons/dollar.svg';
import 'elements/swapSwitch/SwapSwitch.css';
import { useAppSelector } from 'store';
import { useDispatch } from 'react-redux';
import { setUsdToggle } from 'store/user/user';
import { ButtonToggle } from 'components/button/Button';

export const SwapSwitch = ({ disabled }: { disabled?: boolean }) => {
  const dispatch = useDispatch();
  const isEnabled = useAppSelector<boolean>((state) => state.user.usdToggle);
  const setIsEnabled = (state: boolean) => {
    dispatch(setUsdToggle(state));
  };

  return (
    <div className="w-[80px] h-[40px]">
      <ButtonToggle
        labels={[
          <IconCoins key="coin" className="w-[20px] h-[17px] m-8" />,
          <IconDollar key="dollar" className="w-[20px] h-[17px] m-8" />,
        ]}
        onClass="bg-white text-black dark:bg-charcoal dark:text-white"
        disabled={disabled}
        toggle={isEnabled}
        setToggle={() => setIsEnabled(!isEnabled)}
      />
    </div>
  );
};

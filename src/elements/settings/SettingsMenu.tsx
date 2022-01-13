import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCog } from 'assets/icons/cog.svg';
import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { useDispatch } from 'react-redux';
import {
  setCurrency,
  setDarkMode,
  setSlippageTolerance,
} from 'redux/user/user';
import { useAppSelector } from 'redux/index';
import { MenuSecondaryItem } from 'elements/sidebar/menuSecondary/MenuSecondaryItem';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { privacyPolicy, tos } from 'services/router';
import { Dropdown } from 'components/dropdown/Dropdown';
import { Currency, getCurrencyName } from 'utils/currencies';
import { enumValues } from 'utils/pureFunctions';

const currencies = enumValues(Currency).map((currency: Currency) => ({
  id: currency.toString(),
  title: getCurrencyName(currency),
  value: currency,
}));

export const SettingsMenu = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('');

  const dispatch = useDispatch();
  const currentSlippage = useAppSelector<number>(
    (state) => state.user.slippageTolerance
  );
  const currency = useAppSelector<number>((state) => state.user.currency);
  const slippages = [0.001, 0.005, 0.01];

  const content = (
    <>
      <div className="space-y-15">
        <div className="flex justify-between">
          <div>Color Mode</div>
          <div className="flex items-center">
            <button onClick={() => dispatch(setDarkMode(false))}>
              <IconSun className="w-20" />
            </button>
            <span className="mx-10">|</span>
            <button onClick={() => dispatch(setDarkMode(true))}>
              <IconMoon className="w-15" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Currencies</div>
          <div className=" w-[150px]">
            <Dropdown
              selected={currency}
              setSelected={(currency: any) => {
                dispatch(setCurrency(currency.value));
              }}
              title={getCurrencyName(currency)}
              items={currencies}
            />
          </div>
        </div>

        <hr className="border-grey-3 mt-15 mb-10" />

        <div>
          <div className="mb-15">Slippage Tolerance</div>
          <div className="flex justify-between space-x-6">
            {slippages.map((slippage) => (
              <button
                key={slippage}
                onClick={() => dispatch(setSlippageTolerance(slippage))}
                className={`w-full font-medium border border-grey-3 rounded-[12px] text-12 p-8 ${
                  currentSlippage === slippage
                    ? 'bg-primary !border-primary text-white'
                    : ''
                }`}
              >
                +{slippage * 100}%
              </button>
            ))}
            <input
              type="text"
              className={`w-[69px] dark:bg-blue-2 outline-none border border-grey-3 text-center text-12 rounded-[12px] ${
                currentSlippage === Number(customSlippage) / 100
                  ? 'bg-primary text-white placeholder-white'
                  : ''
              }`}
              onFocus={() => {
                if (!Number.isNaN(customSlippage)) {
                  dispatch(setSlippageTolerance(Number(customSlippage) / 100));
                }
              }}
              value={customSlippage}
              onChange={(event) => {
                const { value } = event.target;
                if (!Number.isNaN(value)) {
                  dispatch(setSlippageTolerance(Number(value) / 100));
                }
                setCustomSlippage(value);
              }}
              placeholder="Custom"
            />
          </div>
        </div>
      </div>

      <hr className="border-grey-3 mt-15 mb-10" />

      <div className="text-center">
        <NavLink exact strict to={tos} className="hover:underline">
          Terms of Use
        </NavLink>
        <span className="mx-10">|</span>
        <NavLink exact strict to={privacyPolicy} className="hover:underline">
          Privacy Policy
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      <Popover className="hidden md:block relative">
        <Popover.Button className="flex items-center">
          <IconCog className="w-[20px]" />
        </Popover.Button>

        <DropdownTransition>
          <Popover.Panel className="dropdown-menu w-[324px]">
            <div className="dropdown-bubble" />
            <div className="dropdown-header">Settings</div>

            {content}
          </Popover.Panel>
        </DropdownTransition>
      </Popover>

      <div className="md:hidden">
        <button onClick={() => setShowSettings(true)} className="w-full">
          <MenuSecondaryItem
            label="Settings"
            icon={<IconCog className="w-20" />}
            subMenu={[]}
          />
        </button>
        <ModalFullscreen
          title="Settings"
          setIsOpen={setShowSettings}
          isOpen={showSettings}
          showHeader
        >
          {content}
        </ModalFullscreen>
      </div>
    </>
  );
};

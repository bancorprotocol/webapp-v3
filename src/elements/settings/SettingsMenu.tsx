import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconMenu } from 'assets/icons/menu.svg';
import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { useDispatch } from 'react-redux';
import { setDarkMode, setSlippageTolerance } from 'redux/user/user';
import { useAppSelector } from 'redux/index';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { privacyPolicy, tos } from 'services/router';
import { DarkMode } from './DarkMode';

export const SettingsMenu = () => {
  const [customSlippage, setCustomSlippage] = useState('');

  const dispatch = useDispatch();
  const currentSlippage = useAppSelector<number>(
    (state) => state.user.slippageTolerance
  );

  const slippages = [0.001, 0.005, 0.01];

  const content = (
    <>
      <div className="space-y-15">
        {isMobile && (
          <>
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
            <hr className="border-grey-3 mt-15 mb-10" />
          </>
        )}

        <div className="text-black-low">Slippage Tolerance</div>
        <div className="flex flex-col gap-[25px]">
          <div className="flex justify-between space-x-6">
            {slippages.map((slippage) => (
              <button
                key={slippage}
                onClick={() => dispatch(setSlippageTolerance(slippage))}
                className={`w-full border border-silver rounded-[12px] text-12 p-8 ${
                  currentSlippage === slippage
                    ? 'bg-primary !border-primary text-black'
                    : ''
                }`}
              >
                +{slippage * 100}%
              </button>
            ))}
            <input
              type="text"
              className={`w-[69px] dark:bg-blue-2 outline-none text-center text-12 rounded-[12px] ${
                currentSlippage === Number(customSlippage) / 100
                  ? 'bg-primary text-black placeholder-black'
                  : 'bg-fog'
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
          <DarkMode />
        </div>
      </div>

      <hr className="border-grey-3 mt-15 mb-10" />
      {isMobile ? (
        <>
          <div>
            <NavLink
              exact
              strict
              to={privacyPolicy}
              className="hover:underline"
            >
              Privacy Policy
            </NavLink>
          </div>
          <hr className="border-grey-3 mt-15 mb-10" />
          <div>
            <NavLink exact strict to={tos} className="hover:underline">
              Terms of Use
            </NavLink>
            <hr className="border-grey-3 mt-15 mb-10" />
          </div>
        </>
      ) : (
        <div className="text-center">
          <NavLink exact strict to={tos} className="hover:underline">
            Terms of Use
          </NavLink>
          <span className="mx-10">|</span>
          <NavLink exact strict to={privacyPolicy} className="hover:underline">
            Privacy Policy
          </NavLink>
        </div>
      )}
    </>
  );

  return (
    <>
      <Popover className="hidden md:block relative">
        <Popover.Button className="flex items-center">
          <IconMenu className="w-[20px]" />
        </Popover.Button>

        <DropdownTransition>
          <Popover.Panel className="dropdown-menu w-[324px]">
            {content}
          </Popover.Panel>
        </DropdownTransition>
      </Popover>
    </>
  );
};

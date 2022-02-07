import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconMenu } from 'assets/icons/menu.svg';
import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { ReactComponent as IconFiat } from 'assets/icons/fiat.svg';
import { ReactComponent as IconTwitter } from 'assets/icons/twitter.svg';
import { ReactComponent as IconReddit } from 'assets/icons/reddit.svg';
import { ReactComponent as IconTelegram } from 'assets/icons/telegram.svg';
import { ReactComponent as IconDiscord } from 'assets/icons/discord.svg';
import { useDispatch } from 'react-redux';
import { setDarkMode, setSlippageTolerance } from 'redux/user/user';
import { useAppSelector } from 'redux/index';
import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { fiat, privacyPolicy, tos } from 'services/router';
import { DarkMode } from './DarkMode';
import { Navigate } from 'components/navigate/Navigate';

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
            <hr className="border-fog mt-15 mb-10" />
          </>
        )}

        <div className="text-black-low">Slippage Tolerance</div>
        <div className="flex flex-col gap-[25px] text-black-low">
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
          <Navigate to={fiat}>
            <div className="flex items-center gap-10 text-black">
              <IconFiat className="w-20" />
              Buy crypto with fiat
            </div>
          </Navigate>
          <hr className="border-fog" />
          <Navigate to={fiat}>Help Center</Navigate>
          <Navigate to={fiat}>FAQ</Navigate>
          <Navigate to="https://duneanalytics.com/Bancor/bancor_1">
            Analytics
          </Navigate>
          <Navigate to="https://docs.bancor.network/">Developers</Navigate>
          <Navigate to={tos}>Terms Of Use</Navigate>
          <Navigate to={privacyPolicy}>Privacy Policy</Navigate>
          <div className="flex justify-between text-graphite">
            <Navigate to="https://twitter.com/Bancor">
              <IconTwitter className="h-20" />
            </Navigate>
            <Navigate to="https://t.me/bancor">
              <IconTelegram className="h-20" />
            </Navigate>
            <Navigate to="https://discord.gg/CAm3Ncyrxk">
              <IconDiscord className="h-20" />
            </Navigate>
            <Navigate to="https://www.reddit.com/r/Bancor/">
              <IconReddit className="h-20" />
            </Navigate>
          </div>
        </div>
      </div>
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

import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconMenu } from 'assets/icons/menu.svg';
import { ReactComponent as IconFiat } from 'assets/icons/fiat.svg';
import { ReactComponent as IconTwitter } from 'assets/icons/twitter.svg';
import { ReactComponent as IconReddit } from 'assets/icons/reddit.svg';
import { ReactComponent as IconTelegram } from 'assets/icons/telegram.svg';
import { ReactComponent as IconDiscord } from 'assets/icons/discord.svg';
import { ReactComponent as IconVote } from 'assets/icons/vote.svg';
import { ReactComponent as IconCoins } from 'assets/icons/coins.svg';
import { ReactComponent as IconForum } from 'assets/icons/forum.svg';
import { useDispatch } from 'react-redux';
import { setSlippageTolerance } from 'store/user/user';
import { useAppSelector } from 'store';
import { useState } from 'react';
import { DarkMode } from './DarkMode';
import { Navigate } from 'components/navigate/Navigate';
import { BancorURL } from 'router/bancorURL.service';
import { config } from 'config';

export const SettingsMenu = () => {
  return (
    <>
      <Popover className="relative hidden md:block">
        <Popover.Button className="flex items-center">
          <IconMenu className="w-[20px]" />
        </Popover.Button>
        <DropdownTransition>
          <Popover.Panel className="dropdown-menu w-[324px]">
            <SettingsMenuContent />
          </Popover.Panel>
        </DropdownTransition>
      </Popover>
    </>
  );
};

export const SettingsMenuContent = ({ mobile }: { mobile?: boolean }) => {
  const currentSlippage = useAppSelector<number>(
    (state) => state.user.slippageTolerance
  );
  const slippages = [0.001, 0.005, 0.01];
  const [customSlippage, setCustomSlippage] = useState(
    slippages.includes(currentSlippage)
      ? ''
      : (currentSlippage * 100).toString()
  );

  const dispatch = useDispatch();

  const normalizedSlippage = Number(customSlippage) / 100;
  return (
    <div className="space-y-15 text-black-low dark:text-white-low">
      <div>Slippage Tolerance</div>
      <div className="flex flex-col gap-[25px]">
        <div className="flex justify-between space-x-6">
          {slippages.map((slippage) => (
            <button
              key={slippage}
              onClick={() => {
                dispatch(setSlippageTolerance(slippage));
                setCustomSlippage('');
              }}
              className={`w-full border border-silver dark:border-grey text-black dark:text-white rounded-[12px] text-12 p-8 ${
                currentSlippage === slippage ? 'bg-fog dark:bg-grey' : ''
              }`}
            >
              +{slippage * 100}%
            </button>
          ))}
          <span
            className={`flex items-center border border-silver dark:border-grey rounded-[12px] pr-5 text-12 text-black dark:text-white ${
              currentSlippage === normalizedSlippage &&
              !slippages.includes(currentSlippage)
                ? 'bg-fog dark:bg-grey'
                : 'bg-white dark:bg-black'
            }`}
          >
            <input
              type="text"
              className={`w-[60px] border-none outline-none text-center ${
                currentSlippage === normalizedSlippage &&
                !slippages.includes(currentSlippage)
                  ? 'bg-fog dark:bg-grey'
                  : 'bg-white dark:bg-black'
              }`}
              value={customSlippage}
              onChange={(event) => setCustomSlippage(event.target.value)}
              onBlur={() => {
                if (
                  customSlippage.trim() !== '' &&
                  !isNaN(Number(customSlippage))
                )
                  dispatch(setSlippageTolerance(normalizedSlippage));

                slippages.includes(currentSlippage) && setCustomSlippage('');
              }}
              placeholder="Custom"
            />
            %
          </span>
        </div>
        {mobile ? (
          <>
            <Navigate to={BancorURL.tokens}>
              <div className="flex items-center gap-10 text-black dark:text-white">
                <IconCoins className="w-20 text-black dark:text-white" />
                Tokens
              </div>
            </Navigate>
            <Navigate to={BancorURL.vote}>
              <div className="flex items-center gap-10 text-black dark:text-white">
                <IconVote className="w-20 text-black dark:text-white" />
                Vote
              </div>
            </Navigate>
            <Navigate to={config.externalUrls.governance}>
              <div className="flex items-center gap-10 text-black dark:text-white">
                <IconForum className="w-20 text-black dark:text-white" />
                DAO Forum
              </div>
            </Navigate>
          </>
        ) : (
          <DarkMode showText />
        )}
        <Navigate to={BancorURL.fiat}>
          <div className="flex items-center gap-10 text-black dark:text-white">
            <IconFiat className="w-20" />
            Buy crypto with fiat
          </div>
        </Navigate>
        <hr className="border-fog dark:border-grey" />
        <Navigate to={config.externalUrls.support}>Help Center / FAQ</Navigate>
        <Navigate to={config.externalUrls.duneAnalytics}>Analytics</Navigate>
        <Navigate to={config.externalUrls.bancorAnalytics}>
          Analytics V3
        </Navigate>
        <Navigate to={config.externalUrls.documentation}>Developers</Navigate>
        <Navigate to={BancorURL.termsOfUse}>Terms Of Use</Navigate>
        <Navigate to={BancorURL.privacyPolicy}>Privacy Policy</Navigate>
        <div className="flex justify-between text- dark:black-disabled">
          <Navigate to={config.externalUrls.bancorTwitter}>
            <IconTwitter className="h-20" />
          </Navigate>
          <Navigate to={config.externalUrls.bancorTelegram}>
            <IconTelegram className="h-20" />
          </Navigate>
          <Navigate to={config.externalUrls.bancorDiscord}>
            <IconDiscord className="h-20" />
          </Navigate>
          <Navigate to={config.externalUrls.bancorReddit}>
            <IconReddit className="h-20" />
          </Navigate>
        </div>
      </div>
    </div>
  );
};

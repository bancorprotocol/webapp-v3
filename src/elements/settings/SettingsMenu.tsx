import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCog } from 'assets/icons/cog.svg';
import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { useDispatch } from 'react-redux';
import { setDarkMode, setSlippageTolerance } from 'redux/user/user';
import { useAppSelector } from 'redux/index';
import { MenuSecondaryItem } from 'elements/sidebar/menuSecondary/MenuSecondaryItem';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';
import { useState } from 'react';

export const SettingsMenu = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('');

  const dispatch = useDispatch();
  const currentSlippage = useAppSelector<number>(
    (state) => state.user.slippageTolerance
  );

  console.log({ currentSlippage });
  const slippages = [0.01, 0.03, 0.05];

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
        <hr className="border-grey-3 mt-15 mb-10" />

        <div>
          <div className="mb-6">Slippage Tolerance</div>
          <div className="grid grid-cols-4 gap-10">
            {slippages.map((slippage) => (
              <button
                onClick={() => dispatch(setSlippageTolerance(slippage))}
                className={`border rounded p-4 ${
                  currentSlippage === slippage ? 'bg-primary text-white' : ''
                }`}
              >
                +{slippage * 100}%
              </button>
            ))}
            <input
              type="text"
              className={`border text-right rounded px-10 ${
                currentSlippage === Number(customSlippage) / 100
                  ? 'bg-primary text-white'
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
                  console.log(value, 'should be getting set');
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

      <div className="text-12">Version 3.0.2</div>
    </>
  );

  return (
    <>
      <Popover className="hidden md:block relative">
        <Popover.Button className="flex items-center">
          <IconCog className="w-[20px]" />
        </Popover.Button>

        <DropdownTransition>
          <Popover.Panel className="dropdown-menu">
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

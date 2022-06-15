import { UseWalletConnect } from './useWalletConnect';
import { shortenString } from 'utils/pureFunctions';
import { Image } from 'components/image/Image';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { ReactComponent as IconDisconnect } from 'assets/icons/disconnect.svg';
import { Button, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useState } from 'react';

export const WalletConnectButton = ({
  handleWalletButtonClick,
  account,
  selectedWallet,
}: UseWalletConnect) => {
  const buttonText = account ? shortenString(account) : 'Connect';
  const [isOpen, setIsOpen] = useState(false);

  const loggedIn = selectedWallet && account;

  return (
    <PopoverV3
      className="w-[240px]"
      hover={false}
      showArrow={false}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      buttonElement={() => (
        <Button
          className={`flex items-center justify-center px-5 h-40 dark:bg-grey dark:hover:bg-white ${
            loggedIn ? 'w-[180px]' : 'w-[115px]'
          }`}
          variant={ButtonVariant.Tertiary}
          onClick={() =>
            account ? setIsOpen(!isOpen) : handleWalletButtonClick()
          }
        >
          {loggedIn ? (
            <Image
              src={selectedWallet.icon}
              alt="Wallet Logo"
              className="w-20"
            />
          ) : (
            <IconWallet className="w-20" />
          )}
          <span className="mx-10">{buttonText}</span>
        </Button>
      )}
      options={{
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ],
      }}
    >
      <div>
        Ethereum Network
        <hr className="border-silver dark:border-grey my-15" />
        <button
          onClick={() => {
            handleWalletButtonClick();
            setIsOpen(false);
          }}
          className="flex items-center gap-10"
        >
          <IconDisconnect className="w-20 h-20" />
          Disconnect
        </button>
      </div>
    </PopoverV3>
  );
};

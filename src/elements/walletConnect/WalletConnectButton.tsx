import { UseWalletConnect } from './useWalletConnect';
import { ReactComponent as IconDisconnect } from 'assets/icons/disconnect.svg';
import { Button, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactNode } from 'react';
import { Image } from 'components/image/Image';
import { shortenString } from 'utils/pureFunctions';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';

const LoginButton = ({
  loggedIn,
  handleClick,
  children,
}: {
  loggedIn?: boolean;
  handleClick?: Function;
  children: ReactNode;
}) => {
  return (
    <Button
      className={`flex items-center justify-center px-5 h-40 dark:bg-grey dark:hover:bg-white ${
        loggedIn ? 'w-[180px]' : 'w-[130px]'
      }`}
      variant={ButtonVariant.Tertiary}
      onClick={() => handleClick && handleClick()}
    >
      {children}
    </Button>
  );
};

export const WalletConnectButton = ({
  handleWalletButtonClick,
  account,
  selectedWallet,
}: UseWalletConnect) => {
  const loggedIn = !!selectedWallet && !!account;

  return loggedIn ? (
    <PopoverV3
      className="w-[240px]"
      hover={loggedIn}
      showArrow={false}
      buttonElement={() => (
        <LoginButton loggedIn>
          <Image src={selectedWallet.icon} alt="Wallet Logo" className="w-20" />
          <span className="mx-10">{shortenString(account)}</span>
        </LoginButton>
      )}
      options={{
        placement: 'bottom-end',
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
          onClick={() => handleWalletButtonClick()}
          className="flex items-center gap-10 hover:text-primary"
        >
          <IconDisconnect className="w-20 h-20" />
          Disconnect
        </button>
      </div>
    </PopoverV3>
  ) : (
    <LoginButton handleClick={handleWalletButtonClick}>
      <IconWallet className="w-20" />
      <span className="mx-10">Connect</span>
    </LoginButton>
  );
};

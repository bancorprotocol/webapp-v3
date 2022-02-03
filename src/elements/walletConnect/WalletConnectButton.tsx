import { UseWalletConnect } from './useWalletConnect';
import { shortenString } from 'utils/pureFunctions';
import { Image } from 'components/image/Image';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';

export const WalletConnectButton = ({
  handleWalletButtonClick,
  account,
  selectedWallet,
}: UseWalletConnect) => {
  const buttonText = account ? shortenString(account) : 'Connect';

  return (
    <button
      className="flex items-center md:btn-sm"
      onClick={() => handleWalletButtonClick()}
    >
      {selectedWallet && account ? (
        <Image
          src={selectedWallet.icon}
          alt="Wallet Logo"
          className="w-[20px]"
        />
      ) : (
        <IconWallet className="text-primary dark:text-primary-light w-[13px]" />
      )}
      <span className="hidden md:block md:mx-10">{buttonText}</span>
    </button>
  );
};

import { UseWalletConnect } from './useWalletConnect';
import { shortenString } from 'utils/pureFunctions';
import { Image } from 'components/image/Image';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';

export const WalletConnectButton = ({
  handleWalletButtonClick,
  account,
  selectedWallet,
}: UseWalletConnect) => {
  const buttonText = account ? shortenString(account) : 'Connect Wallet';

  return (
    <button
      className="flex items-center text-12 border border-silver rounded-full md:px-20 hover:bg-silver transition-all duration-300 dark:bg-charcoal dark:border-charcoal h-[35px] md:mr-40"
      onClick={() => handleWalletButtonClick()}
    >
      {selectedWallet && account ? (
        <Image
          src={selectedWallet.icon}
          alt="Wallet Logo"
          className="w-[22px]"
        />
      ) : (
        <IconWallet className="text-primary dark:text-primary-light w-[22px]" />
      )}
      <span className="hidden md:block md:mx-10">{buttonText}</span>
    </button>
  );
};

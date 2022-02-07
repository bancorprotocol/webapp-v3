import { UseWalletConnect } from './useWalletConnect';
import { shortenString } from 'utils/pureFunctions';
import { Image } from 'components/image/Image';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { Button } from 'components/button/Button';

export const WalletConnectButton = ({
  handleWalletButtonClick,
  account,
  selectedWallet,
}: UseWalletConnect) => {
  const buttonText = account ? shortenString(account) : 'Connect';

  return (
    <Button
      className="flex items-center bg-white h-40 text-black dark:text-white dark:bg-grey"
      onClick={() => handleWalletButtonClick()}
    >
      {selectedWallet && account ? (
        <Image src={selectedWallet.icon} alt="Wallet Logo" className="w-20" />
      ) : (
        <IconWallet className="w-20" />
      )}
      <span className="hidden md:block md:mx-10">{buttonText}</span>
    </Button>
  );
};

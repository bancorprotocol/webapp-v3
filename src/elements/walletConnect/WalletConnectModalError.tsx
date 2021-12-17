import { UseWalletConnect } from './useWalletConnect';
import { Image } from 'components/image/Image';
import { isMobile } from 'react-device-detect';

export const WalletConnectModalError = ({
  selectedWallet,
}: UseWalletConnect) => {
  const showMetaMaskMobileError =
    isMobile && selectedWallet?.name === 'MetaMask';
  return (
    <div>
      <div className={`flex justify-center items-center mt-20 mb-40`}>
        <Image
          src={selectedWallet?.icon}
          alt="Wallet Logo"
          className="w-64 h-64 mr-30"
        />
        <h2 className="font-bold text-20">{selectedWallet?.name}</h2>
      </div>
      {showMetaMaskMobileError ? (
        <div className="mb-20 p-20 space-y-10">
          <p className="font-semibold">Use MetaMask In-App Browser</p>
          <p>1. Open MetaMask App on your mobile device</p>
          <p>2. Find the In-App Browser in the MetaMask Menu</p>
          <p>3. Navigate to https://app.bancor.network</p>
        </div>
      ) : (
        <div className="bg-error text-white mb-20 p-20 rounded-30 text-center">
          <p className="font-semibold mb-5">
            {`Failed Connecting to ${
              selectedWallet ? selectedWallet.name : 'Wallet'
            }`}
          </p>
          <p className="text-12">Please try again or contact support</p>
        </div>
      )}
    </div>
  );
};

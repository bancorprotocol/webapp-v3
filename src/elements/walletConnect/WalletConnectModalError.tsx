import { UseWalletConnect } from './useWalletConnect';
import { Image } from 'components/image/Image';

export const WalletConnectModalError = ({
  selectedWallet,
}: UseWalletConnect) => {
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
      <div className="bg-error text-white mb-20 p-20 rounded-30 text-center">
        <p className="font-semibold mb-5">
          {`Failed Connecting to ${
            selectedWallet ? selectedWallet.name : 'Wallet'
          }`}
        </p>
        <p className="text-12">Please try again or contact support</p>
      </div>
    </div>
  );
};

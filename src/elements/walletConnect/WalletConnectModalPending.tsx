import { UseWalletConnect } from './useWalletConnect';
import { Image } from 'components/image/Image';

export const WalletConnectModalPending = ({
  selectedWallet,
}: UseWalletConnect) => {
  return (
    <div
      className={`flex justify-center items-center mt-20 mb-40 animate-pulse`}
    >
      <Image
        src={selectedWallet?.icon}
        alt="Wallet Logo"
        className="w-64 h-64 mr-30"
      />
      <h2 className="font-bold text-20">{selectedWallet?.name}</h2>
    </div>
  );
};

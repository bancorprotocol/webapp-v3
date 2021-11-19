import { WalletConnectButton } from './WalletConnectButton';
import { WalletConnectModal } from './WalletConnectModal';
import { useWalletConnect } from './useWalletConnect';

export const WalletConnect = () => {
  const wallet = useWalletConnect();

  return (
    <>
      <WalletConnectButton {...wallet} />
      <WalletConnectModal {...wallet} />
    </>
  );
};

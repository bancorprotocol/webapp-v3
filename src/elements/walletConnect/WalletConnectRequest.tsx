import { Button, ButtonVariant, ButtonSize } from 'components/button/Button';
import { ReactComponent as IconWallet } from 'assets/icons/bigWallet.svg';
import { useWalletConnect } from 'elements/walletConnect/useWalletConnect';

export const WalletConnectRequest = () => {
  const { handleWalletButtonClick } = useWalletConnect();

  return (
    <div className="flex flex-col items-center gap-36 mx-auto">
      <IconWallet />
      <div className="text-3xl text-center max-w-[448px]">
        Connect wallet to see your portfolio holdings
      </div>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Meduim}
        onClick={() => handleWalletButtonClick()}
      >
        Connect Wallet
      </Button>
    </div>
  );
};

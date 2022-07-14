import { Modal } from 'modals';
import { UseWalletConnect } from '../elements/walletConnect/useWalletConnect';
import { WalletConnectModalList } from '../elements/walletConnect/WalletConnectModalList';
import { WalletConnectModalPending } from '../elements/walletConnect/WalletConnectModalPending';
import { WalletConnectModalError } from '../elements/walletConnect/WalletConnectModalError';

export const WalletConnectModal = (props: UseWalletConnect) => {
  const { isPending, isError } = props;

  return (
    <Modal
      {...props}
      onClose={() => {
        props.setIsOpen(false);
        props.reset();
      }}
    >
      <div className="max-h-[calc(70vh-60px)] overflow-auto px-20">
        {isError ? (
          <WalletConnectModalError {...props} />
        ) : isPending ? (
          <WalletConnectModalPending {...props} />
        ) : (
          <WalletConnectModalList {...props} />
        )}
      </div>
    </Modal>
  );
};

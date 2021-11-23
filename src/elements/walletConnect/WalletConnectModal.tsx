import { Modal } from 'components/modal/Modal';
import { UseWalletConnect } from './useWalletConnect';
import { WalletConnectModalList } from './WalletConnectModalList';
import { WalletConnectModalPending } from './WalletConnectModalPending';
import { WalletConnectModalError } from './WalletConnectModalError';

export const WalletConnectModal = (props: UseWalletConnect) => {
  const { isPending, isError } = props;

  return (
    <Modal {...props}>
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

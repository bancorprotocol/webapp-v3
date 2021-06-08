import { useEffect, useState } from 'react';
import { SUPPORTED_WALLETS } from 'web3/wallet/utils';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { Modal } from 'components/modal/Modal';
import { setAutoLogin } from 'utils/pureFunctions';

interface WalletModalProps {
  isOpen: boolean;
  setIsOpen: Function;
}

export const WalletModal = ({ isOpen, setIsOpen }: WalletModalProps) => {
  const { activate, account } = useWeb3React();
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const tryConnecting = async (connector: AbstractConnector | undefined) => {
    setPending(true);

    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    )
      connector.walletConnectProvider = undefined;

    connector &&
      activate(connector, undefined, true)
        .then(() => {
          setIsOpen(false);
          setAutoLogin(true);
        })
        .catch((error) => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector);
            setAutoLogin(true);
          } else setError(true);
        });
  };

  useEffect(() => {
    if (account) setIsOpen(false);
  }, [account, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setError(false);
      setPending(false);
    }
  }, [isOpen]);

  return (
    <Modal title="Connect Wallet" setIsOpen={setIsOpen} isOpen={isOpen}>
      {error ? (
        <div>error</div>
      ) : pending ? (
        <div>pending</div>
      ) : (
        <div className="flex flex-col mb-20 mt-10 space-y-15">
          <>
            {SUPPORTED_WALLETS.map((wallet, index) => {
              return (
                <button
                  key={index}
                  onClick={() => tryConnecting(wallet.connector)}
                  className="flex items-center w-full px-16 py-10 border-2 border-grey-2 rounded-20 hover:border-primary focus:outline-none focus:border-primary"
                >
                  <img src={wallet.icon} alt="" className="w-32 h-32 mr-20" />
                  {wallet.name}
                </button>
              );
            })}
          </>
        </div>
      )}
    </Modal>
  );
};

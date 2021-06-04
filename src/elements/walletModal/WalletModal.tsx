import { useState } from 'react';
import { SUPPORTED_WALLETS } from 'web3/wallet/utils';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { Modal } from '../../components/modal/Modal';

interface WalletModalProps {
  isOpen: boolean;
  setIsOpen: Function;
}

export const WalletModal = ({ isOpen, setIsOpen }: WalletModalProps) => {
  const { activate } = useWeb3React();
  const [pending, setPending] = useState<AbstractConnector | undefined>();
  const [error, setError] = useState<boolean>(false);

  const tryConnecting = async (connector: AbstractConnector | undefined) => {
    setPending(connector);

    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    )
      connector.walletConnectProvider = undefined;

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) activate(connector);
        else setError(true);
      });
  };

  return (
    <Modal title="Connect Wallet" setIsOpen={setIsOpen} isOpen={isOpen}>
      <div className="flex flex-col mb-20 mt-10 space-y-15">
        <>
          {SUPPORTED_WALLETS.map((wallet, index) => {
            return (
              <button
                key={index}
                onClick={() => tryConnecting(wallet.connector)}
                className="flex items-center w-full px-16 py-10 border-2 border-grey-2 rounded-20 focus:outline-none focus:border-primary"
              >
                <img src={wallet.icon} alt="" className="w-32 h-32 mr-20" />
                {wallet.name}
              </button>
            );
          })}
        </>
      </div>
    </Modal>
  );
};

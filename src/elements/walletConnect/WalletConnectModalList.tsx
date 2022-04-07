import { UseWalletConnect } from './useWalletConnect';
import { Image } from 'components/image/Image';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { setUser } from 'services/observables/user';
import { WalletInfo } from 'services/web3/wallet/utils';
import { setSigner } from 'services/web3';
import { providers, utils } from 'ethers';

export const WalletConnectModalList = ({
  handleConnect,
  SUPPORTED_WALLETS,
  setSelectedWallet,
}: UseWalletConnect) => {
  const className =
    'flex items-center w-full px-16 py-10 border-2 border-silver dark:border-grey rounded-20 hover:border-primary dark:hover:border-primary focus:outline-none focus:border-primary dark:focus:border-primary';
  return (
    <div className="flex flex-col mb-20 mt-10 space-y-15">
      {SUPPORTED_WALLETS.map((wallet) => {
        return wallet.name === 'Imposter' ? (
          <ImposterWallet
            key={wallet.name}
            wallet={wallet}
            className={className}
            setSelectedWallet={setSelectedWallet}
          />
        ) : (
          <button
            key={wallet.name}
            onClick={() => handleConnect(wallet)}
            className={`${!wallet.mobile ? 'hidden md:flex' : ''} ${className}`}
          >
            <Image
              src={wallet.icon}
              alt="Wallet Logo"
              className="w-32 h-32 mr-20"
            />
            {wallet.name}
          </button>
        );
      })}
    </div>
  );
};

export const ImposterWallet = ({
  wallet,
  className,
  setSelectedWallet,
}: {
  wallet: WalletInfo;
  className: string;
  setSelectedWallet: Function;
}) => {
  const [account, setAccount] = useState('');
  const dispatch = useDispatch();

  return (
    <div className={className}>
      <Image src={wallet.icon} alt="Wallet Logo" className="w-32 h-32 mr-20" />
      <input
        value={account}
        placeholder={'0x12345...'}
        onChange={(event) => setAccount(event.target.value)}
        className="w-full mr-10 focus:outline-none"
      />
      <button
        style={{ background: 'red' }}
        className="rounded-10 text-white w-[135px] h-[30px]"
        onClick={() => {
          if (account && utils.isAddress(account)) {
            setSelectedWallet(wallet);
            setUser(account, dispatch);
            setSigner(
              new providers.JsonRpcProvider(
                'https://rpc.tenderly.co/fork/2635a185-e6bf-4e4c-809c-ac236a302f74'
              ).getUncheckedSigner(account)
            );
          }
        }}
      >
        Set User
      </button>
    </div>
  );
};

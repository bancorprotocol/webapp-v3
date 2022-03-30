import { EthNetworks } from 'services/web3/types';
import { getNetworkName } from 'utils/helperFunctions';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { getProvider, setProvider, setSigner } from 'services/web3';
import { useAppSelector } from 'redux/index';
import { Web3Provider } from '@ethersproject/providers';
import { useDispatch } from 'react-redux';
import { setIsFork } from 'redux/user/user';

export const NetworkIndicator = ({
  connector,
}: {
  connector?: AbstractConnector;
}) => {
  const isFork = useAppSelector<boolean>((state) => state.user.isFork);
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );
  const dispatch = useDispatch();

  return (
    <button
      onClick={async () => {
        dispatch(setIsFork(!isFork));
        setProvider(getProvider(EthNetworks.Mainnet, !isFork));

        if (isFork && connector)
          setSigner(
            new Web3Provider(await connector.getProvider()).getSigner()
          );
        else setSigner(undefined, account);
      }}
      className="flex items-center h-[35px] px-20 text-12 rounded-full bg-fog border border-graphite text-charcoal dark:text-white text-opacity-50 dark:text-opacity-50 dark:border-grey dark:bg-black"
    >
      <div
        className={`${
          isFork ? 'bg-error' : 'bg-success'
        } w-6 h-6 rounded-full mr-10`}
      />
      {getNetworkName(isFork)}
    </button>
  );
};

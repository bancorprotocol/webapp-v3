import { EthNetworks } from 'services/web3/types';
import { getNetworkName } from 'utils/helperFunctions';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import { isMainNetFork } from 'services/web3/config';
import { getProvider, setProvider } from 'services/web3';

export const NetworkIndicator = () => {
  const [isFork, setIsFork] = useState(isMainNetFork);

  return (
    <button
      onClick={() => {
        setIsFork(!isFork);
        setProvider(getProvider(EthNetworks.Mainnet, !isFork));
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

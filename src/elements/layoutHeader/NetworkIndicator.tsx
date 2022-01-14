import { EthNetworks } from 'services/web3/types';
import { getNetworkName } from 'utils/helperFunctions';
import { useWeb3React } from '@web3-react/core';

export const NetworkIndicator = () => {
  const { chainId } = useWeb3React();

  return (
    <div className="flex items-center h-[35px] px-20 text-12 rounded-full color-fog border border-graphite text-charcoal">
      <div
        className={`${
          !chainId || chainId === EthNetworks.Mainnet
            ? 'bg-success'
            : chainId === EthNetworks.Ropsten
            ? 'bg-error'
            : 'bg-warning'
        } w-6 h-6 rounded-full mr-10`}
      />
      {getNetworkName(chainId ? chainId : EthNetworks.Mainnet)}
    </div>
  );
};

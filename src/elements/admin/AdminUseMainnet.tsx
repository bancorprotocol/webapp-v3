import { resetTenderly } from 'utils/localStorage';
import { getProvider, setProvider, setSigner } from 'services/web3';
import { EthNetworks } from 'services/web3/types';
import { Web3Provider } from '@ethersproject/providers';
import { Button, ButtonSize } from 'components/button/Button';

export const AdminUseMainnet = () => {
  const handleUseMainnet = () => {
    resetTenderly();
    setProvider(getProvider(EthNetworks.Mainnet, false));
    setSigner(new Web3Provider(window.ethereum).getSigner());
    window.location.reload();
  };

  return (
    <Button onClick={handleUseMainnet} size={ButtonSize.Small}>
      Use Mainnet
    </Button>
  );
};

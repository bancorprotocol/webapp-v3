import { resetTenderly } from 'utils/localStorage';
import {
  ALCHEMY_URL,
  getProvider,
  setProvider,
  setSigner,
} from 'services/web3';
import { EthNetworks } from 'services/web3/types';
import { Button, ButtonSize } from 'components/button/Button';
import { providers } from 'ethers';

export const AdminUseMainnet = () => {
  const handleUseMainnet = () => {
    resetTenderly();
    setProvider(getProvider(EthNetworks.Mainnet, false));
    setSigner(new providers.StaticJsonRpcProvider(ALCHEMY_URL).getSigner());
    window.location.reload();
  };

  return (
    <Button onClick={handleUseMainnet} size={ButtonSize.Small}>
      Use Mainnet
    </Button>
  );
};

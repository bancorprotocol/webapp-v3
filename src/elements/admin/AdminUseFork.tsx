import { useAppSelector } from 'store';
import { useState } from 'react';
import {
  getTenderlyRpcLS,
  setBancorV3Contracts,
  setTenderlyRpcLS,
} from 'utils/localStorage';
import { setProvider, setSigner } from 'services/web3';
import { providers } from 'ethers';
import JSZip from 'jszip';
import { Button, ButtonSize } from 'components/button/Button';

const jsZip = new JSZip();

const filenames = [
  'BancorNetwork_Proxy.json',
  'BancorNetworkInfo_Proxy.json',
  'NetworkSettings_Proxy.json',
  'PendingWithdrawals_Proxy.json',
  'PoolCollectionType1V1.json',
  'StandardRewards_Proxy.json',
  'BancorPortal_Proxy.json',
];

const foldername = 'tenderly';

export interface BancorV3Contracts {
  bancorNetwork: string;
  bancorNetworkInfo: string;
  networkSettings: string;
  pendingWithdrawals: string;
  poolCollectionType1: string;
  standardRewards: string;
  bancorPortal: string;
}

export const AdminUseFork = () => {
  const account = useAppSelector((state) => state.user.account);
  const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
  const [inputContracts, setInputContracts] = useState<BancorV3Contracts>();
  const [zipFileError, setZipFileError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setTenderlyRpcLS(inputRpcUrl);
    setBancorV3Contracts(inputRpcUrl ? inputContracts : undefined);

    const rpc = new providers.JsonRpcProvider(inputRpcUrl);

    setProvider(rpc);
    if (account && inputRpcUrl) {
      setSigner(rpc.getUncheckedSigner(account));
    }
    setSaved(true);
  };

  const handleZipFile = async (files: FileList | null) => {
    const file = files && files[0];
    if (!file) return;

    const zipFile = await jsZip.loadAsync(file);

    try {
      const [
        bancorNetworkAddress,
        bancorNetworkInfoAddress,
        networkSettingsAddress,
        pendingWithdrawalsAddress,
        poolCollectionType1Address,
        standardRewardsAddress,
        bancorPortalAddress,
      ] = await Promise.all(
        filenames.map(async (name) => {
          const res2 = await zipFile
            .folder(foldername)
            ?.file(name)
            ?.async('string');

          if (!res2)
            throw new Error(
              `Error reading zip file. Check that extracted folder is called '${foldername}' and that the file '${name}' exists.`
            );

          return JSON.parse(res2).address;
        })
      );

      setZipFileError('');
      const newInput: BancorV3Contracts = {
        bancorNetwork: bancorNetworkAddress,
        bancorNetworkInfo: bancorNetworkInfoAddress,
        networkSettings: networkSettingsAddress,
        pendingWithdrawals: pendingWithdrawalsAddress,
        poolCollectionType1: poolCollectionType1Address,
        standardRewards: standardRewardsAddress,
        bancorPortal: bancorPortalAddress,
      };
      setInputContracts(newInput);
    } catch (e: any) {
      console.error(e.message);
      setZipFileError(e.message);
    }
  };

  return (
    <div>
      <h2 className="pb-20 text-primary">Use Tenderly Fork</h2>

      <label>
        <div className="font-semibold">Step 1: RPC URL</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5"
          value={inputRpcUrl}
          onChange={(e) => setInputRpcUrl(e.target.value)}
        />
      </label>

      {inputRpcUrl && (
        <label>
          <div className="font-semibold mt-20 mb-10">
            Optional: Select ZIP file
          </div>

          <input type="file" onChange={(e) => handleZipFile(e.target.files)} />
          {zipFileError && (
            <p className="text-error font-semibold">{zipFileError}</p>
          )}
        </label>
      )}

      <Button
        onClick={handleSave}
        size={ButtonSize.EXTRASMALL}
        className="mx-auto mt-20"
      >
        Save
      </Button>
      {saved && (
        <div className="text-success font-semibold text-center mt-10">
          Successfully saved changes! Refresh to make them take effect.
        </div>
      )}
    </div>
  );
};

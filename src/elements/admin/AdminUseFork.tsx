import { useAppSelector } from 'redux/index';
import { useNavigation } from 'services/router';
import { useState } from 'react';
import {
  getTenderlyRpcLS,
  setBancorV3Contracts,
  setTenderlyRpcLS,
} from 'utils/localStorage';
import { setProvider, setSigner } from 'services/web3';
import { providers } from 'ethers';
import JSZip from 'jszip';

const jsZip = new JSZip();

const filenames = [
  'BancorNetwork_Proxy.json',
  'BancorNetworkInfo_Proxy.json',
  'NetworkSettings_Proxy.json',
  'PendingWithdrawals_Proxy.json',
  'PoolCollectionType1V1.json',
  'StandardRewards_Proxy.json',
  'TestToken1.json',
  'TestToken2.json',
  'TestToken3.json',
  'TestToken4.json',
  'TestToken5.json',
  'TestToken6.json',
  'TestToken7.json',
];

const foldername = 'tenderly';

export interface BancorV3Contracts {
  bancorNetwork: string;
  bancorNetworkInfo: string;
  networkSettings: string;
  pendingWithdrawals: string;
  poolCollectionType1: string;
  standardRewards: string;
  testToken1: string;
  testToken2: string;
  testToken3: string;
  testToken4: string;
  testToken5: string;
  testToken6: string;
  testToken7: string;
}

export const AdminUseFork = () => {
  const account = useAppSelector<string | null>((state) => state.user.account);
  const { pushPools } = useNavigation();
  const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
  const [zipFileError, setZipFileError] = useState('');

  const handleSave = (contracts: BancorV3Contracts) => {
    setTenderlyRpcLS(inputRpcUrl);
    setBancorV3Contracts(contracts);

    const rpc = new providers.JsonRpcProvider(inputRpcUrl);

    setProvider(rpc);
    if (account) setSigner(rpc.getUncheckedSigner(account));
    pushPools();
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
        testToken1Address,
        testToken2Address,
        testToken3Address,
        testToken4Address,
        testToken5Address,
        testToken6Address,
        testToken7Address,
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
      const newInput = {
        bancorNetwork: bancorNetworkAddress,
        bancorNetworkInfo: bancorNetworkInfoAddress,
        networkSettings: networkSettingsAddress,
        pendingWithdrawals: pendingWithdrawalsAddress,
        poolCollectionType1: poolCollectionType1Address,
        standardRewards: standardRewardsAddress,
        testToken1: testToken1Address,
        testToken2: testToken2Address,
        testToken3: testToken3Address,
        testToken4: testToken4Address,
        testToken5: testToken5Address,
        testToken6: testToken6Address,
        testToken7: testToken7Address,
      };
      handleSave(newInput);
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
            Step 2: Select ZIP file
          </div>

          <input type="file" onChange={(e) => handleZipFile(e.target.files)} />
          {zipFileError && (
            <p className="text-error font-semibold">{zipFileError}</p>
          )}
        </label>
      )}
    </div>
  );
};

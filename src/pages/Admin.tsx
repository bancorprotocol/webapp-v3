import { DetailedHTMLProps, InputHTMLAttributes, useState } from 'react';
import { Button } from 'components/button/Button';
import {
  getBancorV3Contracts,
  getTenderlyRpcLS,
  setBancorV3Contracts,
  setTenderlyRpcLS,
} from 'utils/localStorage';
import JSZip from 'jszip';
import { setProvider, setSigner } from 'services/web3';
import { providers } from 'ethers';
import { useAppSelector } from 'redux/index';

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
}

const AdminInput = ({ label, ...props }: InputProps) => {
  return (
    <label>
      <span className="font-semibold">{label}</span>
      <input
        type="text"
        className="w-full px-10 py-5 rounded-full mt-5"
        {...props}
      />
    </label>
  );
};

const jsZip = new JSZip();

const filenames = [
  'BancorNetwork_Proxy.json',
  'BancorNetworkInfo_Proxy.json',
  'NetworkSettings_Proxy.json',
  'PendingWithdrawals_Proxy.json',
  'PoolCollectionType1V1.json',
  'StandardStakingRewards_Proxy.json',
  'TestToken1.json',
  'TestToken2.json',
  'TestToken3.json',
  'TestToken4.json',
  'TestToken5.json',
];

const foldername = 'tenderly';

const emptyContractInputs = {
  bancorNetwork: '',
  bancorNetworkInfo: '',
  networkSettings: '',
  pendingWithdrawals: '',
  poolCollectionType1: '',
  standardStakingRewards: '',
  testToken1: '',
  testToken2: '',
  testToken3: '',
  testToken4: '',
  testToken5: '',
};

export interface BancorV3Contracts {
  bancorNetwork: string;
  bancorNetworkInfo: string;
  networkSettings: string;
  pendingWithdrawals: string;
  poolCollectionType1: string;
  standardStakingRewards: string;
  testToken1: string;
  testToken2: string;
  testToken3: string;
  testToken4: string;
  testToken5: string;
}

export const Admin = () => {
  const account = useAppSelector<string | null>((state) => state.user.account);

  const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
  const [zipFileError, setZipFileError] = useState('');
  const [inputs, setInputs] = useState<BancorV3Contracts>(
    getBancorV3Contracts() || emptyContractInputs
  );

  const handleSave = () => {
    setTenderlyRpcLS(inputRpcUrl);
    setBancorV3Contracts(inputRpcUrl ? inputs : emptyContractInputs);

    const rpc = new providers.JsonRpcProvider(inputRpcUrl);

    setProvider(rpc);
    if (account) setSigner(rpc.getUncheckedSigner(account));
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
        standardStakingRewardsAddress,
        testToken1Address,
        testToken2Address,
        testToken3Address,
        testToken4Address,
        testToken5Address,
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
      setInputs({
        bancorNetwork: bancorNetworkAddress,
        bancorNetworkInfo: bancorNetworkInfoAddress,
        networkSettings: networkSettingsAddress,
        pendingWithdrawals: pendingWithdrawalsAddress,
        poolCollectionType1: poolCollectionType1Address,
        standardStakingRewards: standardStakingRewardsAddress,
        testToken1: testToken1Address,
        testToken2: testToken2Address,
        testToken3: testToken3Address,
        testToken4: testToken4Address,
        testToken5: testToken5Address,
      });
    } catch (e: any) {
      console.error(e.message);
      setZipFileError(e.message);
    }
  };

  return (
    <div className="space-y-20">
      <h1 className="my-20">Bancor Network Configurator</h1>

      <AdminInput
        label={'RPC URL'}
        value={inputRpcUrl}
        onChange={(e) => setInputRpcUrl(e.target.value)}
      />

      {inputRpcUrl ? (
        <>
          <h2 className="mb-20 text-primary">Select ABI ZIP file</h2>

          <input type="file" onChange={(e) => handleZipFile(e.target.files)} />
          {zipFileError && (
            <p className="text-error font-semibold">{zipFileError}</p>
          )}
          <h2 className="mb-20 text-primary">Or enter manually</h2>
          <div className="grid grid-cols-2 gap-20 mt-20">
            {Object.keys(inputs).map((key) => (
              <AdminInput
                key={key}
                label={key}
                value={inputs[key as keyof BancorV3Contracts]}
                onChange={(e) =>
                  setInputs((prev: BancorV3Contracts) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
              />
            ))}
          </div>
          <Button onClick={handleSave}>Save</Button>
        </>
      ) : (
        <Button onClick={handleSave}>Use Mainnet</Button>
      )}
    </div>
  );
};

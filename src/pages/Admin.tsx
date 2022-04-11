import { DetailedHTMLProps, InputHTMLAttributes, useState } from 'react';
import { Button } from 'components/button/Button';
import {
  getBancorV3Contracts,
  getTenderlyRpcLS,
  setBancorV3Contracts,
  setTenderlyRpcLS,
} from 'utils/localStorage';
import { useNavigation } from 'services/router';
import JSZip from 'jszip';

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
  const { pushPools } = useNavigation();
  const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
  const [zipFileError, setZipFileError] = useState('');
  const [inputs, setInputs] = useState<BancorV3Contracts>(
    getBancorV3Contracts() || emptyContractInputs
  );

  const handleSave = () => {
    setTenderlyRpcLS(inputRpcUrl);
    setBancorV3Contracts(inputRpcUrl ? inputs : emptyContractInputs);

    pushPools();
    window.location.reload();
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

//
// export const Admin2 = () => {
//   const { pushPools } = useNavigation();
//   const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
//   const [inputBancorNetwork, setInputBancorNetwork] = useState(
//     getContractBancorNetworkLS()
//   );
//   const [inputBancorNetworkInfo, setInputBancorNetworkInfo] = useState(
//     getContractBancorNetworkInfoLS()
//   );
//   const [inputNetworkSettings, setInputNetworkSettings] = useState(
//     getContractNetworkSettingsLS()
//   );
//   const [inputPendingWithdrawals, setInputPendingWithdrawals] = useState(
//     getContractPendingWithdrawalsLS()
//   );
//   const [inputPoolCollection, setInputPoolCollection] = useState(
//     getContractPoolCollectionLS()
//   );
//   const [inputStandardStakingRewards, setInputStandardStakingRewards] =
//     useState(getContractStandardStakingRewardsLS());
//
//   const [inputTKN1, setInputTKN1] = useState(getContractTestToken1LS());
//   const [inputTKN2, setInputTKN2] = useState(getContractTestToken2LS());
//   const [inputTKN3, setInputTKN3] = useState(getContractTestToken3LS());
//   const [inputTKN4, setInputTKN4] = useState(getContractTestToken4LS());
//   const [inputTKN5, setInputTKN5] = useState(getContractTestToken5LS());
//
//   const handleSave = () => {
//     setTenderlyRpcLS(inputRpcUrl);
//
//     setContractBancorNetworkLS(inputRpcUrl ? inputBancorNetwork : '');
//     setContractBancorNetworkInfoLS(inputRpcUrl ? inputBancorNetworkInfo : '');
//     setContractNetworkSettingsLS(inputRpcUrl ? inputNetworkSettings : '');
//     setContractPendingWithdrawalsLS(inputRpcUrl ? inputPendingWithdrawals : '');
//     setContractPoolCollectionLS(inputRpcUrl ? inputPoolCollection : '');
//     setContractStandardStakingRewardsLS(
//       inputRpcUrl ? inputStandardStakingRewards : ''
//     );
//
//     setContractTestToken1LS(inputRpcUrl ? inputTKN1 : '');
//     setContractTestToken2LS(inputRpcUrl ? inputTKN2 : '');
//     setContractTestToken3LS(inputRpcUrl ? inputTKN3 : '');
//     setContractTestToken4LS(inputRpcUrl ? inputTKN4 : '');
//     setContractTestToken5LS(inputRpcUrl ? inputTKN5 : '');
//
//     pushPools();
//     window.location.reload();
//   };
//
//   const handleZipFile = async (files: FileList | null) => {
//     const file = files && files[0];
//     if (!file) return;
//
//     const zipFile = await jsZip.loadAsync(file);
//
//     try {
//       const [
//         bancorNetworkAddress,
//         bancorNetworkInfoAddress,
//         networkSettingsAddress,
//         pendingWithdrawalsAddress,
//         poolCollectionType1Address,
//         standardStakingRewardsAddress,
//         testToken1Address,
//         testToken2Address,
//         testToken3Address,
//         testToken4Address,
//         testToken5Address,
//       ] = await Promise.all(
//         filenames.map(async (name) => {
//           const res2 = await zipFile
//             .folder('tenderlyy')
//             ?.file(name)
//             ?.async('string');
//
//           if (!res2)
//             throw new Error(
//               `Error reading zip file. Check that extracted folder is called 'tenderly' and that the file '${name}' exists.`
//             );
//
//           return JSON.parse(res2).address;
//         })
//       );
//
//       setInputBancorNetwork(bancorNetworkAddress);
//       setInputBancorNetworkInfo(bancorNetworkInfoAddress);
//       setContractNetworkSettingsLS(networkSettingsAddress);
//       setContractPendingWithdrawalsLS(pendingWithdrawalsAddress);
//       setContractPoolCollectionLS(poolCollectionType1Address);
//       setContractStandardStakingRewardsLS(standardStakingRewardsAddress);
//
//       setContractTestToken1LS(testToken1Address);
//       setContractTestToken2LS(testToken2Address);
//       setContractTestToken3LS(testToken3Address);
//       setContractTestToken4LS(testToken4Address);
//       setContractTestToken5LS(testToken5Address);
//     } catch (e: any) {
//       console.error(e.message);
//     }
//   };
//
//   return (
//     <div className="space-y-20">
//       <h2 className="mb-20">Tenderly RPC</h2>
//
//       <input type="file" onChange={(e) => handleZipFile(e.target.files)} />
//
//       <AdminInput
//         label={'RPC URL'}
//         value={inputRpcUrl}
//         setValue={setInputRpcUrl}
//       />
//       {inputRpcUrl ? (
//         <>
//           <h2>Bancor Contracts</h2>
//           <div className="grid grid-cols-2 gap-20 mt-20">
//             <AdminInput
//               label={'Bancor Network'}
//               value={inputBancorNetwork}
//               setValue={setInputBancorNetwork}
//             />
//             <AdminInput
//               label={'Bancor Network Info'}
//               value={inputBancorNetworkInfo}
//               setValue={setInputBancorNetworkInfo}
//             />
//             <AdminInput
//               label={'Network Settings'}
//               value={inputNetworkSettings}
//               setValue={setInputNetworkSettings}
//             />
//             <AdminInput
//               label={'Pending Withdrawals'}
//               value={inputPendingWithdrawals}
//               setValue={setInputPendingWithdrawals}
//             />
//             <AdminInput
//               label={'Pool Collection'}
//               value={inputPoolCollection}
//               setValue={setInputPoolCollection}
//             />
//             <AdminInput
//               label={'Standard Staking Rewards'}
//               value={inputStandardStakingRewards}
//               setValue={setInputStandardStakingRewards}
//             />
//           </div>
//
//           <h2>Test Tokens</h2>
//           <div className="grid grid-cols-2 gap-20 mt-20">
//             <AdminInput
//               label={'TKN1'}
//               value={inputTKN1}
//               setValue={setInputTKN1}
//             />
//             <AdminInput
//               label={'TKN2'}
//               value={inputTKN2}
//               setValue={setInputTKN2}
//             />
//             <AdminInput
//               label={'TKN3'}
//               value={inputTKN3}
//               setValue={setInputTKN3}
//             />
//             <AdminInput
//               label={'TKN4'}
//               value={inputTKN4}
//               setValue={setInputTKN4}
//             />
//             <AdminInput
//               label={'TKN5'}
//               value={inputTKN5}
//               setValue={setInputTKN5}
//             />
//           </div>
//           <Button onClick={handleSave}>Save</Button>
//         </>
//       ) : (
//         <Button onClick={handleSave}>Use Mainnet</Button>
//       )}
//     </div>
//   );
// };

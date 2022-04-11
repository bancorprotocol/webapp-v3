import { useState } from 'react';
import { Button } from 'components/button/Button';
import {
  getContractBancorNetworkInfoLS,
  getContractBancorNetworkLS,
  getContractNetworkSettingsLS,
  getContractPendingWithdrawalsLS,
  getContractPoolCollectionLS,
  getContractStandardStakingRewardsLS,
  getContractTestToken1LS,
  getContractTestToken2LS,
  getContractTestToken3LS,
  getContractTestToken4LS,
  getContractTestToken5LS,
  getTenderlyRpcLS,
  setContractBancorNetworkInfoLS,
  setContractBancorNetworkLS,
  setContractNetworkSettingsLS,
  setContractPendingWithdrawalsLS,
  setContractPoolCollectionLS,
  setContractStandardStakingRewardsLS,
  setContractTestToken1LS,
  setContractTestToken2LS,
  setContractTestToken3LS,
  setContractTestToken4LS,
  setContractTestToken5LS,
  setTenderlyRpcLS,
} from 'utils/localStorage';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { setProvider, setSigner } from 'services/web3';
import { providers } from 'ethers';
import { useAppSelector } from 'redux/index';

const AdminInput = ({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) => {
  return (
    <label>
      <span className="font-semibold">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-10 py-5 rounded-full mt-5"
      />
    </label>
  );
};

export const Admin = () => {
  const account = useAppSelector<string | null>((state) => state.user.account);

  const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
  const [inputBancorNetwork, setInputBancorNetwork] = useState(
    getContractBancorNetworkLS()
  );
  const [inputBancorNetworkInfo, setInputBancorNetworkInfo] = useState(
    getContractBancorNetworkInfoLS()
  );
  const [inputNetworkSettings, setInputNetworkSettings] = useState(
    getContractNetworkSettingsLS()
  );
  const [inputPendingWithdrawals, setInputPendingWithdrawals] = useState(
    getContractPendingWithdrawalsLS()
  );
  const [inputPoolCollection, setInputPoolCollection] = useState(
    getContractPoolCollectionLS()
  );
  const [inputStandardStakingRewards, setInputStandardStakingRewards] =
    useState(getContractStandardStakingRewardsLS());

  const [inputTKN1, setInputTKN1] = useState(getContractTestToken1LS());
  const [inputTKN2, setInputTKN2] = useState(getContractTestToken2LS());
  const [inputTKN3, setInputTKN3] = useState(getContractTestToken3LS());
  const [inputTKN4, setInputTKN4] = useState(getContractTestToken4LS());
  const [inputTKN5, setInputTKN5] = useState(getContractTestToken5LS());

  const handleSave = () => {
    setTenderlyRpcLS(inputRpcUrl);

    setContractBancorNetworkLS(inputRpcUrl ? inputBancorNetwork : '');
    setContractBancorNetworkInfoLS(inputRpcUrl ? inputBancorNetworkInfo : '');
    setContractNetworkSettingsLS(inputRpcUrl ? inputNetworkSettings : '');
    setContractPendingWithdrawalsLS(inputRpcUrl ? inputPendingWithdrawals : '');
    setContractPoolCollectionLS(inputRpcUrl ? inputPoolCollection : '');
    setContractStandardStakingRewardsLS(
      inputRpcUrl ? inputStandardStakingRewards : ''
    );

    setContractTestToken1LS(inputRpcUrl ? inputTKN1 : '');
    setContractTestToken2LS(inputRpcUrl ? inputTKN2 : '');
    setContractTestToken3LS(inputRpcUrl ? inputTKN3 : '');
    setContractTestToken4LS(inputRpcUrl ? inputTKN4 : '');
    setContractTestToken5LS(inputRpcUrl ? inputTKN5 : '');

    const rpc = new providers.JsonRpcProvider(inputRpcUrl);

    setProvider(rpc);
    if (account) setSigner(rpc.getUncheckedSigner(account));
  };

  return (
    <div className="space-y-20">
      <h2 className="mb-20">Tenderly RPC</h2>

      <AdminInput
        label={'RPC URL'}
        value={inputRpcUrl}
        setValue={setInputRpcUrl}
      />
      {inputRpcUrl ? (
        <>
          <h2>Bancor Contracts</h2>
          <div className="grid grid-cols-2 gap-20 mt-20">
            <AdminInput
              label={'Bancor Network'}
              value={inputBancorNetwork}
              setValue={setInputBancorNetwork}
            />
            <AdminInput
              label={'Bancor Network Info'}
              value={inputBancorNetworkInfo}
              setValue={setInputBancorNetworkInfo}
            />
            <AdminInput
              label={'Network Settings'}
              value={inputNetworkSettings}
              setValue={setInputNetworkSettings}
            />
            <AdminInput
              label={'Pending Withdrawals'}
              value={inputPendingWithdrawals}
              setValue={setInputPendingWithdrawals}
            />
            <AdminInput
              label={'Pool Collection'}
              value={inputPoolCollection}
              setValue={setInputPoolCollection}
            />
            <AdminInput
              label={'Standard Staking Rewards'}
              value={inputStandardStakingRewards}
              setValue={setInputStandardStakingRewards}
            />
          </div>

          <h2>Test Tokens</h2>
          <div className="grid grid-cols-2 gap-20 mt-20">
            <AdminInput
              label={'TKN1'}
              value={inputTKN1}
              setValue={setInputTKN1}
            />
            <AdminInput
              label={'TKN2'}
              value={inputTKN2}
              setValue={setInputTKN2}
            />
            <AdminInput
              label={'TKN3'}
              value={inputTKN3}
              setValue={setInputTKN3}
            />
            <AdminInput
              label={'TKN4'}
              value={inputTKN4}
              setValue={setInputTKN4}
            />
            <AdminInput
              label={'TKN5'}
              value={inputTKN5}
              setValue={setInputTKN5}
            />
          </div>
          <Button onClick={handleSave}>Save</Button>
        </>
      ) : (
        <Button onClick={handleSave}>Use Mainnet</Button>
      )}
    </div>
  );
};

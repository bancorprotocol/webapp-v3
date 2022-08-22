import { useAppSelector } from 'store';
import { useState } from 'react';
import {
  getTenderlyRpcLS,
  setTenderlyRpcLS,
  getV3ApiUrlLS,
  setV3ApiUrlLS,
  getV2ApiUrlLS,
  setV2ApiUrlLS,
} from 'utils/localStorage';
import { setProvider, setSigner } from 'services/web3';
import { providers } from 'ethers';
import { Button, ButtonSize } from 'components/button/Button';

export const AdminUseFork = () => {
  const account = useAppSelector((state) => state.user.account);
  const [inputRpcUrl, setInputRpcUrl] = useState(getTenderlyRpcLS());
  const [inputV3ApiUrl, setInputV3ApiUrl] = useState(getV3ApiUrlLS());
  const [inputV2ApiUrl, setInputV2ApiUrl] = useState(getV2ApiUrlLS());

  const handleSave = () => {
    setV3ApiUrlLS(inputV3ApiUrl);
    setV2ApiUrlLS(inputV2ApiUrl);
    setTenderlyRpcLS(inputRpcUrl);
    const rpc = new providers.StaticJsonRpcProvider({
      url: inputRpcUrl,
      skipFetchSetup: true,
    });

    setProvider(rpc);
    if (account && inputRpcUrl) {
      setSigner(rpc.getUncheckedSigner(account));
    }
    window.location.reload();
  };

  return (
    <div>
      <h2 className="pb-20 text-primary">Use Tenderly Fork</h2>

      <div className="flex flex-col items-center justify-between">
        <div className="font-semibold">Step 1: RPC URL</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={inputRpcUrl}
          onChange={(e) => setInputRpcUrl(e.target.value.trim())}
        />

        <div className="mt-20 font-semibold">Step 2 (optional): V3 API URL</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={inputV3ApiUrl}
          onChange={(e) => setInputV3ApiUrl(e.target.value.trim())}
        />

        <div className="mt-20 font-semibold">Step 3 (optional): V2 API URL</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={inputV2ApiUrl}
          onChange={(e) => setInputV2ApiUrl(e.target.value.trim())}
        />
      </div>

      <Button
        onClick={handleSave}
        size={ButtonSize.Small}
        className="mx-auto mt-20"
      >
        Save
      </Button>
    </div>
  );
};

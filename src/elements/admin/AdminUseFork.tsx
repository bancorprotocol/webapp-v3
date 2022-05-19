import { useAppSelector } from 'store';
import { useState } from 'react';
import { getTenderlyRpcLS, setTenderlyRpcLS } from 'utils/localStorage';
import { setProvider, setSigner } from 'services/web3';
import { providers } from 'ethers';
import { Button, ButtonSize } from 'components/button/Button';

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
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setTenderlyRpcLS(inputRpcUrl);
    const rpc = new providers.JsonRpcProvider(inputRpcUrl);

    setProvider(rpc);
    if (account && inputRpcUrl) {
      setSigner(rpc.getUncheckedSigner(account));
    }
    setSaved(true);
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

      <Button
        onClick={handleSave}
        size={ButtonSize.ExtraSmall}
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

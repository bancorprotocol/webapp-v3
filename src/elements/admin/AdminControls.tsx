import { Switch } from 'components/switch/Switch';
import { useDispatch } from 'react-redux';
import { BancorNetworkV3__factory } from 'services/web3/abis/types';
import { useAppSelector } from 'store';
import { setEnableDeposit, setForceV3Routing } from 'store/user/user';
import bancorNetworkAddress from 'services/web3/abis/v3/BancorNetworkV3_Proxy.json';
import { providers } from 'ethers';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import useAsyncEffect from 'use-async-effect';
import { useState } from 'react';

export const AdminControls = () => {
  const dispatch = useDispatch();
  const forceV3Routing = useAppSelector((state) => state.user.forceV3Routing);
  const enableDeposit = useAppSelector((state) => state.user.enableDeposit);

  const [forkEnable, setForkEnable] = useState<boolean>();

  useAsyncEffect(async (isMounted) => {
    if (isMounted())
      setForkEnable(await ContractsApi.BancorNetwork.read.depositingEnabled());
  }, []);

  return (
    <div className="flex items-center justify-center gap-30 mx-10">
      <div className="flex items-center gap-10">
        Force V3
        <Switch
          selected={forceV3Routing}
          onChange={() => dispatch(setForceV3Routing(!forceV3Routing))}
        />
      </div>
      <div className="flex items-center gap-10">
        Enable Deposit
        <Switch
          selected={enableDeposit}
          onChange={() => dispatch(setEnableDeposit(!enableDeposit))}
        />
      </div>
      {forkEnable !== undefined && (
        <div className="flex items-center gap-10">
          Fork Deposit enabled
          <Switch
            selected={forkEnable}
            onChange={() => {
              const signer = new providers.StaticJsonRpcProvider(
                getTenderlyRpcLS()
              ).getUncheckedSigner(process.env.REACT_APP_BANCOR_DEPLOYER);
              BancorNetworkV3__factory.connect(
                bancorNetworkAddress.address,
                signer
              ).enableDepositing(!forkEnable);
              setForkEnable(!forkEnable);
            }}
          />
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { createPool } from 'services/web3/liquidity/liquidity';
import { useWeb3React } from '@web3-react/core';
import { useDispatch } from 'react-redux';
import { addNotification } from 'redux/notification/notification';
import { EthNetworks } from 'services/web3/types';
import { getNetworkVariables } from 'services/web3/config';
import { SelectToken } from 'components/selectToken/SelectToken';

export const CreatePool = () => {
  const { chainId, account } = useWeb3React();
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const [bnt, setBNT] = useState<Token | undefined>();
  const [token, setToken] = useState<Token | null>(null);
  const dispatch = useDispatch();

  const confirm = async () => {
    if (!account || !chainId || !token) return;

    dispatch(addNotification(await createPool(token, chainId, account)));
  };

  useEffect(() => {
    const networkVars = getNetworkVariables(
      chainId ? chainId : EthNetworks.Mainnet
    );
    setBNT(tokens.find((x) => x.address === networkVars.bntToken));
  }, [tokens, chainId]);

  return (
    <div className="bg-white dark:bg-blue-4 h-screen w-screen md:h-auto md:w-auto md:bg-grey-1 md:dark:bg-blue-3">
      <div className="widget mx-auto p-10">
        <div className="flex m-10 items-center">
          <IconChevron className="w-[16px] rotate-180" />
          <div className="text-20 font-semibold text-blue-4 dark:text-grey-0">
            Create Pool
          </div>
        </div>
        <hr className="widget-separator" />
        <div className="mx-10 my-30">
          <SelectToken label="First Token" token={bnt} selectable={false} />
        </div>
        <div className="widget-block">
          <div className="widget-block-icon">
            <IconPlus className="w-[25px] text-primary dark:text-primary-light" />
          </div>
          <div className="my-30">
            <SelectToken
              label="Second Token"
              token={token}
              setToken={setToken}
              selectable
              startEmpty
              excludedTokens={bnt ? [bnt.address] : []}
            />
          </div>

          <button onClick={() => confirm()} className="btn-primary w-full">
            Create a Pool
          </button>
        </div>
      </div>
    </div>
  );
};

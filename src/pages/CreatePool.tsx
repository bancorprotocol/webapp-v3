import { useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';

import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { createPool } from 'services/web3/liquidity/liquidity';
import { useWeb3React } from '@web3-react/core';
import { useDispatch } from 'react-redux';
import { addNotification } from 'redux/notification/notification';

export const CreatePool = () => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const dispatch = useDispatch();
  const { chainId, account } = useWeb3React();

  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [firstToken, setFirstToken] = useState(tokens[0]);
  const [secondToken, setSecondToken] = useState<Token | null>(null);

  const confirm = async () => {
    if (!account || !chainId || !secondToken) return;

    dispatch(addNotification(await createPool(secondToken, chainId, account)));
  };

  return (
    <div className="bg-white dark:bg-blue-4 h-screen w-screen md:h-auto md:w-auto md:bg-grey-1 md:dark:bg-blue-3">
      <div className="widget mx-auto p-10">
        <div className="flex justify-between">
          <IconChevron className="w-[16px] rotate-180" />
          Create Pool
          <IconTimes className="w-[16px] " />
        </div>
        <hr className="widget-separator" />
        <TokenInputField
          label="First Token"
          token={firstToken}
          setToken={setFirstToken}
          input={amount1}
          setInput={setAmount1}
          selectable
          startEmpty
          excludedTokens={secondToken ? [secondToken.address] : []}
        />
        <div className="widget-block">
          <div className="widget-block-icon">
            <IconPlus className="w-[25px] text-primary dark:text-primary-light" />
          </div>
          <div className="mx-10 mb-16 pt-16">
            <TokenInputField
              label="Second Token"
              token={secondToken}
              setToken={setSecondToken}
              input={amount2}
              setInput={setAmount2}
              selectable
              startEmpty
              excludedTokens={firstToken ? [firstToken.address] : []}
            />
          </div>

          <button onClick={() => confirm()} className="btn-primary w-full">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

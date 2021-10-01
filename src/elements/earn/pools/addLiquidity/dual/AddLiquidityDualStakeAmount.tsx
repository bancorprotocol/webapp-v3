import { Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useState } from 'react';
import BigNumber from 'bignumber.js';

interface Props {
  bnt: Token;
  tkn: Token;
  tknAmount: string;
  setTknAmount: Function;
  bntAmount: string;
  setBntAmount: Function;
  bntTknRate: string;
}

export const AddLiquidityDualStakeAmount = ({
  bnt,
  tkn,
  tknAmount,
  setTknAmount,
  bntAmount,
  setBntAmount,
  bntTknRate,
}: Props) => {
  const [bntAmountUsd, setBntAmountUsd] = useState('');
  const [tknAmountUsd, setTknAmountUsd] = useState('');

  const onBntAmountChange = (amount: string) => {
    setBntAmount(amount);
    if (amount === '') {
      setTknAmount('');
      setTknAmountUsd('');
      return;
    }
    const tknAmount = new BigNumber(amount).times(bntTknRate).toString();
    setTknAmount(tknAmount);
    const tknAmountUsd = new BigNumber(tknAmount)
      .times(tkn.usdPrice!)
      .toString();
    setTknAmountUsd(tknAmountUsd);
  };

  const onTknAmountChange = (amount: string) => {
    setTknAmount(amount);
    if (amount === '') {
      setBntAmount('');
      setBntAmountUsd('');
      return;
    }
    const bntAmount = new BigNumber(amount).div(bntTknRate).toString();
    setBntAmount(bntAmount);
    const bntAmountUsd = new BigNumber(bntAmount)
      .times(bnt.usdPrice!)
      .toString();
    setBntAmountUsd(bntAmountUsd);
  };

  return (
    <div className="space-y-20 px-10">
      <div className="font-medium">Enter stake amount</div>
      <TokenInputField
        input={bntAmount}
        setInput={(amount: string) => onBntAmountChange(amount)}
        amountUsd={bntAmountUsd}
        setAmountUsd={setBntAmountUsd}
        token={bnt}
        selectable={false}
        border
      />
      <TokenInputField
        input={tknAmount}
        setInput={(amount: string) => onTknAmountChange(amount)}
        amountUsd={tknAmountUsd}
        setAmountUsd={setTknAmountUsd}
        token={tkn}
        selectable={false}
        border
      />
    </div>
  );
};

import { Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

interface Props {
  bnt: Token;
  tkn: Token;
  tknAmount: string;
  setTknAmount: Function;
  bntAmount: string;
  setBntAmount: Function;
  bntTknRate: string;
  errorBalanceBnt: string;
  setErrorBalanceBnt: Function;
  errorBalanceTkn: string;
  setErrorBalanceTkn: Function;
}

export const AddLiquidityDualStakeAmount = ({
  bnt,
  tkn,
  tknAmount,
  setTknAmount,
  bntAmount,
  setBntAmount,
  bntTknRate,
  errorBalanceBnt,
  setErrorBalanceBnt,
  errorBalanceTkn,
  setErrorBalanceTkn,
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

  useEffect(() => {
    if (new BigNumber(bntAmount).gt(bnt.balance || 0)) {
      setErrorBalanceBnt('Insufficient Balance');
    } else {
      setErrorBalanceBnt('');
    }

    if (new BigNumber(tknAmount).gt(tkn.balance || 0)) {
      setErrorBalanceTkn('Insufficient Balance');
    } else {
      setErrorBalanceTkn('');
    }
  }, [
    bntAmount,
    bnt.balance,
    setErrorBalanceBnt,
    tknAmount,
    tkn.balance,
    setErrorBalanceTkn,
  ]);

  return (
    <div className="px-10">
      <div className="font-medium mb-20">Enter stake amount</div>
      <div className="mb-20">
        <TokenInputField
          input={bntAmount}
          setInput={(amount: string) => onBntAmountChange(amount)}
          amountUsd={bntAmountUsd}
          setAmountUsd={setBntAmountUsd}
          token={bnt}
          selectable={false}
          border
        />
        {errorBalanceBnt && (
          <div className="mt-5 pl-[140px] text-error">{errorBalanceBnt}</div>
        )}
      </div>
      <div className="mb-20">
        <TokenInputField
          input={tknAmount}
          setInput={(amount: string) => onTknAmountChange(amount)}
          amountUsd={tknAmountUsd}
          setAmountUsd={setTknAmountUsd}
          token={tkn}
          selectable={false}
          border
        />
        {errorBalanceTkn && (
          <div className="mt-5 pl-[140px] text-error">{errorBalanceTkn}</div>
        )}
      </div>
    </div>
  );
};

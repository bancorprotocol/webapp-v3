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
  tknUsdPrice: string;
}

export const AddLiquidityEmptyStep2 = ({
  bnt,
  tkn,
  tknAmount,
  setTknAmount,
  bntAmount,
  setBntAmount,
  bntTknRate,
  tknUsdPrice,
}: Props) => {
  const [bntAmountUsd, setBntAmountUsd] = useState('');
  const [tknAmountUsd, setTknAmountUsd] = useState('');

  useEffect(() => {
    setBntAmountUsd('');
    setTknAmountUsd('');
  }, [tknUsdPrice]);

  const tknWithPrice: Token = { ...tkn, usdPrice: tknUsdPrice };

  const onBntAmountChange = (amount: string) => {
    setBntAmount(amount);
    if (amount === '') {
      setTknAmount('');
      setTknAmountUsd('');
      return;
    }
    const tknAmount = new BigNumber(amount).times(bntTknRate).toString();
    setTknAmount(tknAmount);
    const tknAmountUsd = new BigNumber(tknAmount).times(tknUsdPrice).toString();
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
    <div className="space-y-20">
      <div className="flex items-center">
        <div
          className={`flex justify-center items-center w-[34px] h-[34px] border-2 border-blue-0 dark:border-blue-1 rounded-full bg-white dark:bg-blue-4 text-16 ${
            tknUsdPrice ? 'text-primary' : 'text-grey-3'
          }`}
        >
          2
        </div>
        <div
          className={`ml-10 font-medium ${!tknUsdPrice ? 'text-grey-3' : ''}`}
        >
          Enter stake amount
        </div>
      </div>
      <TokenInputField
        input={bntAmount}
        setInput={(amount: string) => onBntAmountChange(amount)}
        amountUsd={bntAmountUsd}
        setAmountUsd={setBntAmountUsd}
        token={bnt}
        selectable={false}
        disabled={!tknUsdPrice}
      />
      <TokenInputField
        input={tknAmount}
        setInput={(amount: string) => onTknAmountChange(amount)}
        amountUsd={tknAmountUsd}
        setAmountUsd={setTknAmountUsd}
        token={tknWithPrice}
        selectable={false}
        disabled={!tknUsdPrice}
      />
    </div>
  );
};

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

  const tknWithPrice: Token = { ...tkn, usdPrice: tknUsdPrice };

  return (
    <div className="space-y-20">
      <div className="flex items-center">
        <div className="flex justify-center items-center w-[34px] h-[34px] border-2 border-blue-0 rounded-full bg-white text-primary text-16">
          2
        </div>
        <div className="ml-10 font-medium">Enter stake amount</div>
      </div>
      <TokenInputField
        input={bntAmount}
        setInput={(amount: string) => {
          setBntAmount(amount);
          const tknAmount = new BigNumber(amount).times(bntTknRate).toString();
          setTknAmount(tknAmount);
          const tknAmountUsd = new BigNumber(tknAmount)
            .times(tknUsdPrice)
            .toString();
          setTknAmountUsd(tknAmountUsd);
        }}
        amountUsd={bntAmountUsd}
        setAmountUsd={setBntAmountUsd}
        token={bnt}
        selectable={false}
      />
      <TokenInputField
        input={tknAmount}
        setInput={(amount: string) => {
          setTknAmount(amount);
          const bntAmount = new BigNumber(amount).div(bntTknRate).toString();
          setBntAmount(bntAmount);
          const bntAmountUsd = new BigNumber(tknAmount)
            .times(tknUsdPrice)
            .toString();
          setBntAmountUsd(bntAmountUsd);
        }}
        amountUsd={tknAmountUsd}
        setAmountUsd={setTknAmountUsd}
        token={tknWithPrice}
        selectable={false}
      />
    </div>
  );
};

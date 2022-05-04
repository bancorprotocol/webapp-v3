import { BigNumber } from 'bignumber.js';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { useState, useEffect } from 'react';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { classNameGenerator } from 'utils/pureFunctions';

interface TokenInputPercentageV3Props {
  label: string;
  token?: Token;
  balance?: string;
  amount: string;
  setAmount: Function;
  balanceLabel?: string;
}
const percentages = [25, 50, 75, 100];

export const TokenInputPercentageV3 = ({
  token,
  balance,
  label,
  amount,
  setAmount,
  balanceLabel = 'Balance',
}: TokenInputPercentageV3Props) => {
  const [amountUSD, setAmountUSD] = useState('');
  const [selPercentage, setSelPercentage] = useState<number>(-1);

  const fieldBalance = balance
    ? balance
    : token && token.balance
    ? token.balance
    : undefined;

  useEffect(() => {
    if (amount && fieldBalance) {
      const percentage = (Number(amount) / Number(fieldBalance)) * 100;
      setSelPercentage(
        percentages.findIndex((x) => percentage.toFixed(10) === x.toFixed(10))
      );
    }
  }, [amount, token, fieldBalance]);

  return (
    <div className="w-full">
      <div className="flex justify-between pr-10 mb-4">
        <span>{label}</span>
        {fieldBalance && (
          <span>
            {balanceLabel}: {prettifyNumber(fieldBalance)}
          </span>
        )}
      </div>
      {token && (
        <TokenInputV3
          token={token}
          inputTkn={amount}
          setInputTkn={setAmount as (amount: string) => void}
          inputFiat={amountUSD}
          setInputFiat={setAmountUSD}
          isFiat={false}
          isError={false}
        />
      )}
      <div className="flex justify-between pb-20">
        {percentages.map((slip, index) => (
          <button
            key={'slippage' + slip}
            className={`btn-sm rounded-10 border border-graphite w-[90px] text-14 btn-outline-secondary bg-opacity-0`}
            onClick={() => {
              setSelPercentage(index);
              if (token && fieldBalance) {
                const amount = new BigNumber(fieldBalance).times(
                  new BigNumber(slip / 100)
                );
                setAmount(amount.toString());
                setAmountUSD(
                  (amount.toNumber() * Number(token.usdPrice)).toString()
                );
              }
            }}
          >
            +{slip}%
          </button>
        ))}
      </div>
    </div>
  );
};

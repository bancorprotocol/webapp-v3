import { BigNumber } from 'bignumber.js';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useState, useEffect } from 'react';
import { Token } from 'services/observables/tokens';
import { classNameGenerator } from 'utils/pureFunctions';

interface TokenInputPercentageProps {
  label: string;
  token?: Token;
  balance?: string;
  amount: string;
  errorMsg?: string;
  setAmount: Function;
  debounce?: Function;
  balanceLabel?: string;
}
const percentages = [25, 50, 75, 100];

export const TokenInputPercentage = ({
  token,
  balance,
  label,
  amount,
  errorMsg,
  setAmount,
  debounce,
  balanceLabel = 'Balance',
}: TokenInputPercentageProps) => {
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
      if (debounce) debounce(amount);
    }
  }, [amount, token, fieldBalance, debounce]);

  return (
    <>
      {token && (
        <TokenInputField
          border
          token={token}
          input={amount}
          label={label}
          errorMsg={errorMsg}
          debounce={debounce}
          setInput={setAmount}
          selectable={false}
          amountUsd={amountUSD}
          setAmountUsd={setAmountUSD}
          fieldBalance={fieldBalance}
          balanceLabel={balanceLabel}
        />
      )}
      <div className="flex justify-between space-x-8 mt-15">
        <div className="md:w-[125px]" />
        {percentages.map((slip, index) => (
          <button
            key={'slippage' + slip}
            className={`btn-sm rounded-10 h-[34px] w-[66px] text-14 ${classNameGenerator(
              {
                'btn-outline-secondary': selPercentage !== index,
                'btn-primary': selPercentage === index,
              }
            )} bg-opacity-0`}
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
    </>
  );
};

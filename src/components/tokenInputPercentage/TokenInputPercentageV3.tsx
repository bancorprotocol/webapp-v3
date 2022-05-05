import { BigNumber } from 'bignumber.js';
import TokenInputV3, {
  TokenInputV3Props,
} from 'components/tokenInput/TokenInputV3';
import { useState, useEffect, useCallback } from 'react';
import { Token } from 'services/observables/tokens';
import { calcFiatValue, prettifyNumber } from 'utils/helperFunctions';

interface TokenInputPercentageV3Props extends TokenInputV3Props {
  label: string;
  balanceLabel?: string;
}
const percentages = [25, 50, 75, 100];

export const TokenInputPercentageV3 = ({
  token,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  isFiat,
  isError,
  label,
  balanceLabel = 'Balance',
}: TokenInputPercentageV3Props) => {
  const fieldBalance = token.balance
    ? token.balance
    : token && token.balance
    ? token.balance
    : undefined;

  const [selPercentage, setSelPercentage] = useState<number>(-1);

  useEffect(() => {
    if (fieldBalance !== undefined) {
      const percentage = new BigNumber(inputTkn)
        .div(fieldBalance)
        .times(100)
        .toNumber()
        .toFixed(10);
      setSelPercentage(
        percentages.findIndex((x) => percentage === x.toFixed(10))
      );
    }
  }, [fieldBalance, inputTkn]);

  return (
    <div className="w-full">
      <div className="flex justify-between pr-10 mb-4">
        <span>{label}</span>
        {fieldBalance && (
          <span>
            {balanceLabel}: {prettifyNumber(fieldBalance)} (~
            {prettifyNumber(calcFiatValue(fieldBalance, token.usdPrice), true)})
          </span>
        )}
      </div>
      {token && (
        <TokenInputV3
          token={token}
          inputTkn={inputTkn}
          setInputTkn={setInputTkn}
          inputFiat={inputFiat}
          setInputFiat={setInputFiat}
          isFiat={isFiat}
          isError={isError}
        />
      )}
      <div className="flex justify-between pb-20">
        {percentages.map((percent, index) => (
          <button
            key={'percent' + percent}
            className={`btn-sm rounded-10 border border-graphite w-[90px] text-14 btn-outline-secondary bg-opacity-0`}
            onClick={() => {
              setSelPercentage(index);
              if (fieldBalance !== undefined) {
                const amount = new BigNumber(fieldBalance).times(percent / 100);
                setInputTkn(amount.toString());
                setInputFiat(calcFiatValue(amount, token.usdPrice));
              }
            }}
          >
            +{percent}%
          </button>
        ))}
      </div>
    </div>
  );
};

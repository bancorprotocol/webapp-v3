import { BigNumber } from 'bignumber.js';
import { ButtonPercentages } from 'components/button/Button';
import TokenInputV3, {
  TokenInputV3Props,
} from 'components/tokenInput/TokenInputV3';
import { useEffect, useState } from 'react';
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

  const handleSetPercentage = (percent: number) => {
    setSelPercentage(percentages.indexOf(percent));
    if (fieldBalance !== undefined) {
      const amount = new BigNumber(fieldBalance).times(percent / 100);
      setInputTkn(amount.toString());
      setInputFiat(calcFiatValue(amount, token.usdPrice));
    }
  };

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
      <div className="flex items-end justify-between mb-10">
        <span>{label}</span>
        {fieldBalance && (
          <button
            onClick={() => handleSetPercentage(100)}
            className={`text-12 ${isError ? 'text-error' : ''}`}
          >
            {balanceLabel}: {prettifyNumber(fieldBalance)}{' '}
            <span className="text-secondary">
              (
              {prettifyNumber(
                calcFiatValue(fieldBalance, token.usdPrice),
                true
              )}
              )
            </span>
          </button>
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
      <div className="flex justify-between gap-16 mt-20 h-[42px]">
        <ButtonPercentages
          percentages={percentages}
          selected={selPercentage}
          onClick={(percentage: number) => {
            handleSetPercentage(percentage);
          }}
        />
      </div>
    </div>
  );
};

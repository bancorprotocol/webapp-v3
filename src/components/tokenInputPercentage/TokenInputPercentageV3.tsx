import { BigNumber } from 'bignumber.js';
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
      <div className="flex justify-between items-end mb-10">
        <span>{label}</span>
        {fieldBalance && (
          <button onClick={() => handleSetPercentage(100)} className="text-12">
            {balanceLabel}: {prettifyNumber(fieldBalance)} (~
            {prettifyNumber(calcFiatValue(fieldBalance, token.usdPrice), true)})
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
      <div className="flex justify-between mt-20">
        {percentages.map((percent, index) => (
          <button
            key={'percent' + percent}
            className={`btn btn-sm rounded-10 border ${
              selPercentage === index
                ? 'btn-primary border-primary'
                : 'border-fog dark:border-grey hover:border-primary'
            }`}
            onClick={() => handleSetPercentage(percent)}
          >
            +{percent}%
          </button>
        ))}
      </div>
    </div>
  );
};

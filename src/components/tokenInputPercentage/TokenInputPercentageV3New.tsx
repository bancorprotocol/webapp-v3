import { BigNumber } from 'bignumber.js';
import { ButtonPercentages } from 'components/button/Button';
import TokenInputV3, {
  TokenInputV3Props,
} from 'components/tokenInput/TokenInputV3';
import { useEffect, useState } from 'react';
import { calcFiatValue, prettifyNumber } from 'utils/helperFunctions';
import { usePoolPick } from 'queries/index';

interface TokenInputPercentageV3Props extends Omit<TokenInputV3Props, 'token'> {
  dltId: string;
  label: string;
  balance?: string;
  balanceLabel?: string;
}
const percentages = [25, 50, 75, 100];

export const TokenInputPercentageV3New = ({
  dltId,
  balance,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  isFiat,
  isError,
  label,
  balanceLabel = 'Balance',
}: TokenInputPercentageV3Props) => {
  const { getOne } = usePoolPick(['decimals', 'rate']);
  const { data: token } = getOne(dltId);
  const [selPercentage, setSelPercentage] = useState<number>(-1);

  const handleSetPercentage = (percent: number) => {
    setSelPercentage(percentages.indexOf(percent));
    if (balance !== undefined && !!token) {
      const amount = new BigNumber(balance).times(percent / 100);
      setInputTkn(amount.toString());
      setInputFiat(calcFiatValue(amount, token.rate?.usd ?? 0));
    }
  };

  useEffect(() => {
    if (balance !== undefined) {
      const percentage = new BigNumber(inputTkn)
        .div(balance)
        .times(100)
        .toNumber()
        .toFixed(10);
      setSelPercentage(
        percentages.findIndex((x) => percentage === x.toFixed(10))
      );
    }
  }, [balance, inputTkn]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-10">
        <span>{label}</span>
        {balance && (
          <button
            onClick={() => handleSetPercentage(100)}
            className={`text-12 ${isError ? 'text-error' : ''}`}
          >
            {balanceLabel}: {prettifyNumber(balance)}{' '}
            <span className="text-secondary">
              (
              {prettifyNumber(
                calcFiatValue(balance, token?.rate?.usd ?? 0),
                true
              )}
              )
            </span>
          </button>
        )}
      </div>
      {token && (
        <TokenInputV3
          dltId={dltId}
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

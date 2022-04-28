import { BigNumber } from 'bignumber.js';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useEffect, useState } from 'react';
import { Token } from 'services/observables/tokens';

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
      <div className="flex justify-end space-x-5 mt-10">
        {percentages.map((slip, index) => (
          <Button
            key={'slippage' + slip}
            size={ButtonSize.EXTRASMALL}
            variant={
              selPercentage === index
                ? ButtonVariant.PRIMARY
                : ButtonVariant.SECONDARY
            }
            className="rounded-10 w-full"
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
          </Button>
        ))}
      </div>
    </>
  );
};

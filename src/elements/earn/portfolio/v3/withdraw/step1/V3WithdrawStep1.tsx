import { Button } from 'components/button/Button';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { memo, useMemo } from 'react';
import { Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import { calcFiatValue, prettifyNumber } from 'utils/helperFunctions';

interface Props {
  token: Token;
  inputTkn: string;
  setInputTkn: (amount: string) => void;
  inputFiat: string;
  setInputFiat: (amount: string) => void;
  setStep: (step: number) => void;
  availableBalance: string;
  isFiat: boolean;
  withdrawalFeeInPercent: string;
  withdrawalFeeInTkn: string;
}

const V3WithdrawStep1 = ({
  token,
  setStep,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  isFiat,
  availableBalance,
  withdrawalFeeInPercent,
  withdrawalFeeInTkn,
}: Props) => {
  const isInputError = useMemo(
    () => new BigNumber(availableBalance).lt(inputTkn),
    [availableBalance, inputTkn]
  );

  const setBalance = (percentage: 25 | 50 | 75 | 100) => {
    const valueTkn = new BigNumber(availableBalance)
      .times(percentage / 100)
      .toString();
    const valueFiat = calcFiatValue(valueTkn, token.usdPrice);
    setInputTkn(valueTkn);
    setInputFiat(valueFiat);
  };

  return (
    <div className="text-center">
      <h1 className="text-[36px] font-normal mb-50">
        How much ETH do you want to withdraw?
      </h1>

      <button
        onClick={() => setBalance(100)}
        className={`${isInputError ? 'text-error' : 'text-secondary'}`}
      >
        Available {availableBalance} ETH
      </button>

      <TokenInputV3
        token={token}
        inputTkn={inputTkn}
        setInputTkn={setInputTkn}
        inputFiat={inputFiat}
        setInputFiat={setInputFiat}
        isFiat={isFiat}
        isError={isInputError}
      />

      <div className="space-x-10 opacity-50">
        <button onClick={() => setBalance(25)}>25%</button>
        <button onClick={() => setBalance(50)}>50%</button>
        <button onClick={() => setBalance(75)}>75%</button>
        <button onClick={() => setBalance(100)}>100%</button>
      </div>

      <div className="flex justify-center">
        <Button
          className="px-50 my-40"
          onClick={() => setStep(2)}
          disabled={!inputTkn || isInputError}
        >
          Next {'->'}
        </Button>
      </div>

      <div className="opacity-50 space-y-10">
        <p>USD value will likely change during the cooldown period</p>
        <span>Coverage cost {withdrawalFeeInPercent}%</span>
        {Number(withdrawalFeeInTkn) > 0 && (
          <>
            <span className="px-10">-</span>
            <span>
              {prettifyNumber(withdrawalFeeInTkn)} {token.symbol}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep1);

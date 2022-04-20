import { Button } from 'components/button/Button';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { memo, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { calcFiatValue, prettifyNumber } from 'utils/helperFunctions';
import { Holding } from 'redux/portfolio/v3Portfolio.types';

interface Props {
  inputTkn: string;
  setInputTkn: (amount: string) => void;
  inputFiat: string;
  setInputFiat: (amount: string) => void;
  setStep: (step: number) => void;
  holdingToWithdraw: Holding;
  isFiat: boolean;
  withdrawalFeeInPercent: string;
  withdrawalFeeInTkn: string;
}

const V3WithdrawStep1 = ({
  holdingToWithdraw,
  setStep,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  isFiat,
  withdrawalFeeInPercent,
  withdrawalFeeInTkn,
}: Props) => {
  const { token, combinedTokenBalance, tokenBalance } = holdingToWithdraw;
  const isInputError = useMemo(
    () => new BigNumber(combinedTokenBalance).lt(inputTkn),
    [combinedTokenBalance, inputTkn]
  );

  const percentageUnstaked = useMemo(
    () =>
      new BigNumber(tokenBalance)
        .div(combinedTokenBalance)
        .multipliedBy(100)
        .toFixed(2),
    [combinedTokenBalance, tokenBalance]
  );

  const setBalance = (percentage: 25 | 50 | 75 | 100) => {
    const valueTkn = new BigNumber(combinedTokenBalance)
      .times(percentage / 100)
      .toString();
    const valueFiat = calcFiatValue(valueTkn, token.usdPrice);
    setInputTkn(valueTkn);
    setInputFiat(valueFiat);
  };

  const skipStep2 = useMemo(
    () => new BigNumber(inputTkn).lte(tokenBalance),
    [inputTkn, tokenBalance]
  );

  const handleNextStep = () => {
    if (skipStep2) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-[36px] font-normal mb-50">
        How much {token.symbol} do you want to withdraw?
      </h1>

      <button
        onClick={() => setBalance(100)}
        className={`${isInputError ? 'text-error' : 'text-secondary'}`}
      >
        Available {prettifyNumber(combinedTokenBalance)} {token.symbol}
      </button>

      <div>Ready to withdraw: {percentageUnstaked}%</div>

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
          onClick={handleNextStep}
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

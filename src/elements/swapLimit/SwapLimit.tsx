import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'utils/dayjs';
import BigNumber from 'bignumber.js';
import { InputField } from 'components/inputField/InputField';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { ModalDuration } from 'elements/modalDuration/modalDuration';
import { TokenListItem } from 'observables/tokens';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import {
  calculatePercentageChange,
  classNameGenerator,
} from 'utils/pureFunctions';
import { useInterval } from 'hooks/useInterval';
import { getRate } from 'web3/swap/methods';
import usePrevious from 'hooks/usePrevious';

enum Field {
  from,
  to,
  rate,
}

interface SwapLimitProps {
  fromToken: TokenListItem;
  setFromToken: Function;
  toToken: TokenListItem;
  setToToken: Function;
  switchTokens: Function;
}

export const SwapLimit = ({
  fromToken,
  setFromToken,
  toToken,
  setToToken,
  switchTokens,
}: SwapLimitProps) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState('');
  const [marketRate, setMarketRate] = useState(-1);
  const prevMarket = usePrevious(marketRate);
  const [percentage, setPercentage] = useState('');
  const [selPercentage, setSelPercentage] = useState(1);
  const [duration, setDuration] = useState(
    dayjs.duration({ days: 7, hours: 0, minutes: 0 })
  );
  const previousField = useRef<Field>();
  const lastChangedField = useRef<Field>();

  const percentages = useMemo(() => [1, 3, 5], []);

  useInterval(() => {
    fetchMarketRate();
  }, 15000);

  const calculatePercentageByRate = useCallback(
    (marketRate: number, rate: string) => {
      const percentage = calculatePercentageChange(Number(rate), marketRate);
      const index = percentages.indexOf(percentage);
      if (index === -1) setPercentage(percentage.toFixed(2));
      else {
        setPercentage('');
        setSelPercentage(index);
      }
    },
    [percentages]
  );

  const calcFrom = (to: string, rate: string) => {
    if (rate && to)
      setFromAmount(new BigNumber(to).div(new BigNumber(rate)).toFixed(6));
  };
  const calcTo = (from: string, rate: string) => {
    if (rate && from)
      setToAmount(new BigNumber(rate).times(new BigNumber(from)).toFixed(6));
  };
  const calcRate = useCallback(
    (from: string, to: string) => {
      if (from && to) {
        const rate = new BigNumber(to).div(new BigNumber(from)).toFixed(6);
        setRate(rate);
        calculatePercentageByRate(marketRate, rate);
      }
    },
    [calculatePercentageByRate, marketRate]
  );

  const handleFieldChanged = useCallback(
    (field: Field, from: string, to: string, rate: string) => {
      if (
        previousField.current !== lastChangedField.current &&
        lastChangedField.current !== field
      )
        previousField.current = lastChangedField.current;
      lastChangedField.current = field;

      switch (field) {
        case Field.from:
          if (previousField.current === Field.to) calcRate(from, to);
          else calcTo(from, rate);
          break;
        case Field.to:
          if (previousField.current === Field.from) calcRate(from, to);
          else calcFrom(to, rate);
          break;
        case Field.rate:
          if (previousField.current === Field.from) calcTo(from, rate);
          else calcFrom(to, rate);
          break;
      }
    },
    [calcRate]
  );

  const calculateRateByMarket = useCallback(
    (marketRate: number, selPercentage: number, percentage: string) => {
      const perc =
        selPercentage === -1
          ? Number(percentage) / 100
          : percentages[selPercentage] / 100;
      const rate = (marketRate * (1 + perc)).toFixed(6);
      handleFieldChanged(Field.rate, fromAmount, toAmount, rate);
      setRate(rate);
    },
    [percentages, fromAmount, toAmount, handleFieldChanged]
  );

  const fetchMarketRate = useCallback(async () => {
    if (!fromToken || !toToken) return;

    const mRate = Number(await getRate(fromToken, toToken, '1'));

    setMarketRate(mRate);
  }, [fromToken, toToken]);

  useEffect(() => {
    if (prevMarket === -1)
      calculateRateByMarket(marketRate, selPercentage, percentage);
  }, [
    calculateRateByMarket,
    marketRate,
    selPercentage,
    percentage,
    prevMarket,
  ]);

  useEffect(() => {
    fetchMarketRate();
  }, [fetchMarketRate, fromToken, toToken]);

  return (
    <div>
      <div className="px-20">
        <TokenInputField
          label="You Pay"
          balance={123.4567}
          balanceUsd={98.76}
          token={fromToken}
          setToken={setFromToken}
          input={fromAmount}
          onChange={(val: string) => {
            setFromAmount(val);
            handleFieldChanged(Field.from, val, toAmount, rate);
          }}
          border
          selectable
        />
      </div>

      <div className="widget-block">
        <div className="widget-block-icon cursor-pointer">
          <IconSync
            className="w-[25px] text-primary dark:text-primary-light"
            onClick={() => switchTokens()}
          />
        </div>
        <div className="mx-10 mb-16 pt-16">
          <TokenInputField
            label="You Receive"
            balance={123.4567}
            balanceUsd={98.76}
            token={toToken}
            setToken={setToToken}
            input={toAmount}
            onChange={(val: string) => {
              setToAmount(val);
              handleFieldChanged(Field.to, fromAmount, val, rate);
            }}
            selectable
          />
          <div className="flex justify-between items-center my-15">
            <div className="whitespace-nowrap mr-15 text-20">{`1 ${fromToken?.symbol} =`}</div>
            <InputField
              format
              input={rate}
              onChange={(val: string) => {
                setRate(val);
                calculatePercentageByRate(marketRate, val);
                handleFieldChanged(Field.rate, fromAmount, toAmount, val);
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            {percentages.map((slip, index) => (
              <button
                key={'slippage' + slip}
                className={classNameGenerator({
                  'text-primary': selPercentage === index,
                })}
                onClick={() => {
                  calculateRateByMarket(marketRate, index, '');
                  setSelPercentage(index);
                  setPercentage('');
                }}
              >
                +{slip}%
              </button>
            ))}
            <div className="w-96">
              <InputField
                input={percentage}
                onBlur={() => {
                  const percNum = Number(percentage);
                  const index = percentages.indexOf(percNum);
                  if (index !== -1 || !percNum) setPercentage('');

                  const sel = percNum
                    ? index
                    : selPercentage === -1
                    ? 1
                    : selPercentage;
                  calculateRateByMarket(marketRate, sel, percentage);
                  setSelPercentage(sel);
                }}
                onChange={(val: string) => {
                  calculateRateByMarket(marketRate, -1, val);
                  setPercentage(val);
                }}
                format
              />
            </div>
          </div>
          <div className="flex justify-between mt-15">
            <span>Expires in</span>
            <ModalDuration duration={duration} setDuration={setDuration} />
          </div>
        </div>

        <button className="btn-primary rounded w-full">Swap</button>
      </div>
    </div>
  );
};

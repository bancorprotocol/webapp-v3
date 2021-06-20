import { useRef, useState } from 'react';
import dayjs from 'utils/dayjs';
import BigNumber from 'bignumber.js';
import { InputField } from 'components/inputField/InputField';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { ModalDuration } from 'elements/modalDuration/modalDuration';
import { TokenListItem } from 'observables/tokenList';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';

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
  const [slippage, setSlippage] = useState('');
  const [rateText, setRateText] = useState('');
  const [duration, setDuration] = useState(
    dayjs.duration({ days: 7, hours: 0, minutes: 0 })
  );

  const previousField = useRef<Field>();
  const lastChangedField = useRef<Field>();
  const rateImmed = useRef<string>();
  const fromImmed = useRef<string>();
  const toImmed = useRef<string>();

  const sliipageOptions = [1, 3, 5];

  const calcFrom = () => {
    if (rateImmed.current && toImmed.current) {
      setFromAmount(
        new BigNumber(rateImmed.current)
          .div(new BigNumber(toImmed.current))
          .toFixed(6)
      );
    }
  };
  const calcTo = () => {
    if (rateImmed.current && fromImmed.current)
      setToAmount(
        new BigNumber(rateImmed.current)
          .times(new BigNumber(fromImmed.current))
          .toFixed(6)
      );
  };
  const calcRate = () => {
    if (fromImmed.current && toImmed.current)
      setRate(
        new BigNumber(fromImmed.current)
          .div(new BigNumber(toImmed.current))
          .toFixed(6)
      );
  };

  const handleFieldChanged = (field: Field) => {
    if (
      previousField.current !== lastChangedField.current &&
      lastChangedField.current !== field
    )
      previousField.current = lastChangedField.current;
    lastChangedField.current = field;
    switch (field) {
      case Field.from:
        if (previousField.current === Field.to) calcRate();
        else calcTo();
        break;
      case Field.to:
        if (previousField.current === Field.from) calcRate();
        else calcFrom();
        break;
      case Field.rate:
        if (previousField.current === Field.from) calcTo();
        else calcFrom();
        break;
    }
  };

  const changeRateText = () => {
    setRateText(`1 ${fromToken.symbol} = ${toToken.symbol}`);
  };

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
            fromImmed.current = val;
            handleFieldChanged(Field.from);
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
              toImmed.current = val;
              handleFieldChanged(Field.to);
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
                rateImmed.current = val;
                handleFieldChanged(Field.rate);
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            {sliipageOptions.map((slip) => (
              <button
                key={'slippage' + slip}
                onClick={() => setSlippage(slip.toString())}
              >
                +{slip}%
              </button>
            ))}
            <div className="w-96">
              <InputField input={slippage} setInput={setSlippage} format />
            </div>
          </div>

          <ModalDuration duration={duration} setDuration={setDuration} />
          <div className="flex justify-between mt-15">
            <span>Rate</span>
            <span>{`1 ${fromToken?.symbol} = 0.00155432 `}</span>
          </div>
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>0.2000%</span>
          </div>
        </div>

        <button className="btn-primary rounded w-full">Swap Limit</button>
      </div>
    </div>
  );
};

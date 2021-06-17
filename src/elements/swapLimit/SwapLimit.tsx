import BigNumber from 'bignumber.js';
import { InputField } from 'components/inputField/InputField';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { TokenListItem } from 'observables/tokenList';
import { useRef, useState } from 'react';
import { useAppSelector } from 'redux/index';

enum Field {
  from,
  to,
  rate,
}

export const SwapLimit = () => {
  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancorAPI.tokens
  );
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState('');

  const previousField = useRef<Field>();
  const lastChangedField = useRef<Field>();
  const rateImmed = useRef<string>();
  const fromImmed = useRef<string>();
  const toImmed = useRef<string>();

  const calcFrom = () => {
    if (rateImmed.current && toImmed.current) {
      setFromAmount(
        new BigNumber(rateImmed.current)
          .div(new BigNumber(toImmed.current))
          .toFixed(2)
      );
    }
  };
  const calcTo = () => {
    if (rateImmed.current && fromImmed.current)
      setToAmount(
        new BigNumber(rateImmed.current)
          .div(new BigNumber(fromImmed.current))
          .toFixed(2)
      );
  };
  const calcRate = () => {
    if (fromImmed.current && toImmed.current)
      setRate(
        new BigNumber(fromImmed.current)
          .times(new BigNumber(toImmed.current))
          .toFixed(2)
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

      <div className="widget-block mt-20">
        <div className="mx-10 mb-16">
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
            <div className="whitespace-nowrap mr-15">{`1 BNT =`}</div>
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

          <div className="flex justify-between mt-15">
            <span>Rate</span>
            <span>1 BNT = 0.00155432 ETH</span>
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

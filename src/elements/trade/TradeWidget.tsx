import { Button } from 'components/button/Button';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTradeInputToken } from 'elements/trade/useTradeInputToken';
import { useState } from 'react';
import { Token } from 'services/observables/tokens';
import { useSearchParams } from 'react-router-dom';
import { useNavigation } from 'hooks/useNavigation';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';

interface Props {
  from?: string;
  to?: string;
  tokens: Token[];
}

export const TradeWidget = ({ from, to, tokens }: Props) => {
  const { fromInput, toInput, isLoading } = useTradeInputToken({
    from,
    to,
    tokens,
  });

  const [tradeType, setTradeType] = useState<'byTarget' | 'bySource'>(
    'bySource'
  );

  const [searchParams] = useSearchParams();
  const { goToPage } = useNavigation();

  return (
    <div className="md:min-w-[485px]">
      <div className="px-10 mb-10">
        <TradeWidgetInput
          label={'You pay'}
          tokens={tokens}
          input={fromInput}
          onFocus={() => setTradeType('bySource')}
          onTokenSelect={(token: Token) => {
            goToPage.tradeBeta(
              {
                from: token.address,
                to: searchParams.get('to') ?? undefined,
              },
              true
            );
          }}
          isLoading={
            (isLoading && tradeType === 'byTarget') || toInput?.isTyping
          }
        />
      </div>
      <div className="bg-secondary p-10 rounded-30 pt-20">
        <TradeWidgetInput
          label={'You receive'}
          tokens={tokens}
          input={toInput}
          onTokenSelect={(token: Token) => {
            goToPage.tradeBeta(
              {
                from: searchParams.get('from') ?? undefined,
                to: token.address,
              },
              true
            );
          }}
          onFocus={() => setTradeType('byTarget')}
          isLoading={
            (isLoading && tradeType === 'bySource') || fromInput?.isTyping
          }
        />
        {fromInput && toInput && fromInput.inputTkn !== '' && (
          <div className="px-10 mt-10">
            <div className="flex justify-between">
              <div>Rate</div>
              <div>
                1 {fromInput?.token.symbol} ={' '}
                {prettifyNumber(
                  toBigNumber(toInput?.inputTkn ?? 0).div(
                    fromInput?.inputTkn ?? 0
                  )
                )}{' '}
                {toInput?.token.symbol}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Price Impact</div>
              <div>1 {fromInput?.token.symbol}</div>
            </div>
          </div>
        )}

        <Button
          className="w-full mt-10"
          disabled={!toBigNumber(fromInput?.inputTkn ?? 0).gt(0)}
        >
          {!toBigNumber(fromInput?.inputTkn ?? 0).gt(0)
            ? 'Enter Amount'
            : 'Trade'}
        </Button>
      </div>
    </div>
  );
};

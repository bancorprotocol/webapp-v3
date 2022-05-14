import { Button } from 'components/button/Button';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTradeInputToken } from 'elements/trade/useTradeInputToken';
import { useState } from 'react';
import { Token } from 'services/observables/tokens';
import { useSearchParams } from 'react-router-dom';
import { useNavigation } from 'hooks/useNavigation';

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
        <Button className="w-full mt-10">Trade</Button>
      </div>
    </div>
  );
};

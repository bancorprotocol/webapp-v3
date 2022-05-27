import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTradeWidget } from 'elements/trade/useTradeWidget';
import { Token } from 'services/observables/tokens';
import { useTrade } from 'elements/trade/useTrade';
import { TradeWidgetDetails } from 'elements/trade/TradeWidgetDetails';
import { TradeWidgetCTA } from 'elements/trade/TradeWidgetCTA';
import { TradeWidgetSwitchBtn } from 'elements/trade/TradeWidgetSwitchBtn';

interface Props {
  from?: string;
  to?: string;
  tokens: Token[];
}

export const TradeWidget = (props: Props) => {
  const tradeWidget = useTradeWidget(props);
  const trade = useTrade(tradeWidget);

  return (
    <div className="w-full">
      <div className="px-10 mb-[34px]">
        <TradeWidgetInput
          label={'You pay'}
          tokens={tradeWidget.filteredTokens}
          input={tradeWidget.fromInput}
          onTokenSelect={trade.handleSelectFrom}
          errorMsg={trade.errorInsufficientBalance}
        />
      </div>

      <div className="bg-secondary p-10 rounded-30 pt-30 relative">
        <TradeWidgetSwitchBtn {...trade} />

        <TradeWidgetInput
          disabled
          label={'You receive'}
          tokens={tradeWidget.filteredTokens}
          input={tradeWidget.toInput}
          onTokenSelect={trade.handleSelectTo}
          isLoading={tradeWidget.isLoading || tradeWidget.fromInput?.isTyping}
        />

        <TradeWidgetDetails {...tradeWidget} />

        <TradeWidgetCTA {...trade} {...tradeWidget} />
      </div>
      {trade.ApproveModal}
    </div>
  );
};

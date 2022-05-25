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

export const TradeWidget = ({ from, to, tokens }: Props) => {
  const { fromInput, toInput, isLoading, priceImpact, filteredTokens } =
    useTradeWidget({
      from,
      to,
      tokens,
    });

  const {
    handleCTAClick,
    ApproveModal,
    isBusy,
    handleSelectFrom,
    handleSelectTo,
    handleSelectSwitch,
    errorInsufficientBalance,
  } = useTrade(fromInput, toInput);

  return (
    <div className="w-full md:min-w-[485px]">
      <div className="px-10 mb-[34px]">
        <TradeWidgetInput
          label={'You pay'}
          tokens={filteredTokens}
          input={fromInput}
          onTokenSelect={handleSelectFrom}
          errorMsg={errorInsufficientBalance}
        />
      </div>

      <div className="bg-secondary p-10 rounded-30 pt-30 relative">
        <TradeWidgetSwitchBtn handleSelectSwitch={handleSelectSwitch} />

        <TradeWidgetInput
          disabled
          label={'You receive'}
          tokens={filteredTokens}
          input={toInput}
          onTokenSelect={handleSelectTo}
          isLoading={isLoading || fromInput?.isTyping}
        />

        <TradeWidgetDetails
          fromInput={fromInput}
          toInput={toInput}
          isLoading={isLoading}
          priceImpact={priceImpact}
        />

        <TradeWidgetCTA
          handleCTAClick={handleCTAClick}
          isBusy={isBusy}
          errorInsufficientBalance={errorInsufficientBalance}
        />
      </div>
      {ApproveModal}
    </div>
  );
};

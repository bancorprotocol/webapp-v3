import { Button } from 'components/button/Button';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTradeWidget } from 'elements/trade/useTradeWidget';
import { useMemo } from 'react';
import { Token } from 'services/observables/tokens';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { useTrade } from 'elements/trade/useTrade';

interface Props {
  from?: string;
  to?: string;
  tokens: Token[];
}

export const TradeWidget = ({ from, to, tokens }: Props) => {
  const { fromInput, toInput, isLoading, priceImpact } = useTradeWidget({
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

  const filteredTokens = useMemo(
    () => tokens.filter((t) => t.address !== from && t.address !== to),
    [from, to, tokens]
  );

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
        <button
          onClick={handleSelectSwitch}
          className="transform hover:rotate-180 transition duration-500 rounded-full border-2 border-fog bg-white w-40 h-40 flex items-center justify-center absolute top-[-20px] left-[32px]"
        >
          <IconSync className="w-[25px] text-primary dark:text-primary-light" />
        </button>

        <TradeWidgetInput
          disabled
          label={'You receive'}
          tokens={filteredTokens}
          input={toInput}
          onTokenSelect={handleSelectTo}
          isLoading={isLoading || fromInput?.isTyping}
        />

        {fromInput && toInput && fromInput.inputTkn !== '' && (
          <div className="px-10 mt-10">
            <div className="flex justify-between">
              <div>Rate</div>
              {isLoading || fromInput.isTyping || toInput.isTyping ? (
                <div className="loading-skeleton h-10 w-[180px] bg-white" />
              ) : (
                <div>
                  1 {fromInput?.token.symbol} ={' '}
                  {prettifyNumber(
                    toBigNumber(toInput.inputTkn ?? 0).div(
                      fromInput.inputTkn ?? 0
                    )
                  )}{' '}
                  {toInput?.token.symbol}
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <div>Price Impact</div>
              {isLoading || fromInput.isTyping || toInput.isTyping ? (
                <div className="loading-skeleton h-10 w-[100px] bg-white" />
              ) : (
                <div>{prettifyNumber(priceImpact)} %</div>
              )}
            </div>
          </div>
        )}

        <Button
          className="w-full mt-10"
          onClick={handleCTAClick}
          disabled={
            !fromInput ||
            !toInput ||
            !toBigNumber(fromInput?.inputTkn ?? 0).gt(0) ||
            isBusy ||
            !!errorInsufficientBalance
          }
        >
          {!toBigNumber(fromInput?.inputTkn ?? 0).gt(0)
            ? 'Enter Amount'
            : 'Trade'}
        </Button>
      </div>
      {ApproveModal}
    </div>
  );
};

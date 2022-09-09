import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { UseTradeWidgetReturn } from 'elements/trade/useTradeWidget';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useMemo } from 'react';

export const TradeWidgetDetails = ({
  fromInput,
  toInput,
  isLoading,
  priceImpact,
  isV3,
  isExternal,
}: UseTradeWidgetReturn) => {
  const loading = useMemo(
    () => isLoading || fromInput?.isTyping || toInput?.isTyping,
    [fromInput?.isTyping, isLoading, toInput?.isTyping]
  );

  return (
    <>
      {fromInput && toInput && fromInput.inputTkn !== '' && (
        <div className="px-10 mt-15 text-secondary">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              Best Rate
              <PopoverV3
                children="Version routing to ensure you get the best rate possible for your trade"
                buttonElement={() => (
                  <div className="ml-5 px-5 rounded text-12 bg-primary dark:bg-black dark:bg-opacity-30 bg-opacity-20 text-primary-dark">
                    {isExternal ? 'external' : isV3 ? 'V3' : 'V2'}
                  </div>
                )}
              />
            </div>
            {loading ? (
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
            {loading ? (
              <div className="loading-skeleton h-10 w-[100px] bg-white" />
            ) : (
              <div
                className={`${
                  toBigNumber(priceImpact ?? '0').gte(5) ? 'text-error' : ''
                }`}
              >
                {priceImpact ? prettifyNumber(priceImpact) : 'unknown '} %
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

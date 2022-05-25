import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { useTokenInputV3Return } from 'elements/trade/useTknFiatInput';

interface Props {
  fromInput?: useTokenInputV3Return;
  toInput?: useTokenInputV3Return;
  isLoading: boolean;
  priceImpact: string;
}

export const TradeWidgetDetails = ({
  fromInput,
  toInput,
  isLoading,
  priceImpact,
}: Props) => {
  return (
    <>
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
    </>
  );
};

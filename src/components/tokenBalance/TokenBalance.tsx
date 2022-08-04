import BigNumber from 'bignumber.js';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
interface Props {
  symbol: string;
  amount: string;
  usdPrice: string;
  imgUrl: string;
  inverted?: boolean;
  deficitAmount?: string;
  abbreviate?: boolean;
}
export const TokenBalance = ({
  symbol,
  amount,
  usdPrice,
  imgUrl,
  inverted,
  deficitAmount,
  abbreviate,
}: Props) => {
  const usdAmount = new BigNumber(amount).times(usdPrice).toString();

  return (
    <div className={`flex ${inverted ? '' : 'items-center'}`}>
      <Image
        alt={`${symbol} Logo`}
        src={imgUrl}
        className="w-40 h-40 mr-10 !rounded-full"
      />
      <div className={`${inverted ? 'text-right' : ''}`}>
        <div className="flex items-center gap-5 text-justify text-16">
          {inverted ? (
            <>
              <div className={'uppercase'}>
                {prettifyNumber(amount, { abbreviate })}
              </div>
              {symbol}
            </>
          ) : (
            <>
              {symbol}
              <div className={'uppercase'}>
                {prettifyNumber(amount, { abbreviate: true })}
              </div>
            </>
          )}
          {deficitAmount && (
            <PopoverV3
              buttonElement={() => <IconWarning className="text-error" />}
            >
              <span className="text-secondary">
                Due to vault deficit, current value is{' '}
                {prettifyNumber(deficitAmount)} {symbol}
              </span>
            </PopoverV3>
          )}
        </div>
        <span className="text-secondary">
          {prettifyNumber(usdAmount, { usd: true })}
        </span>
      </div>
    </div>
  );
};

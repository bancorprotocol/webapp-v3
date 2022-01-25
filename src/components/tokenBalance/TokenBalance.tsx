import { Image } from 'components/image/Image';
import BigNumber from 'bignumber.js';
import { prettifyNumber } from 'utils/helperFunctions';

interface Props {
  symbol: string;
  amount: string;
  usdPrice: string;
  imgUrl: string;
  inverted?: boolean;
}
export const TokenBalance = ({
  symbol,
  amount,
  usdPrice,
  imgUrl,
  inverted,
}: Props) => {
  const usdAmount = new BigNumber(amount).times(usdPrice).toString();
  const label = inverted
    ? `${symbol} ${prettifyNumber(amount)}`
    : `${prettifyNumber(amount)} ${symbol}`;

  return (
    <div className={`flex w-full ${inverted ? '' : 'items-center'}`}>
      <Image alt={`${symbol} Logo`} src={imgUrl} className="w-40 h-40 mr-10" />
      <div className={`text-16 w-full ${inverted ? 'text-right' : ''}`}>
        <div>{label}</div>
        <span className="text-graphite">{prettifyNumber(usdAmount, true)}</span>
      </div>
    </div>
  );
};

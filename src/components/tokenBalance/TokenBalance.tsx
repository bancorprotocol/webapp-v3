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
    ? `${prettifyNumber(amount)} ${symbol}`
    : `${symbol} ${prettifyNumber(amount)}`;

  return (
    <div className={`flex ${inverted ? '' : 'items-center'}`}>
      <Image alt={`${symbol} Logo`} src={imgUrl} className="w-40 h-40 mr-10" />
      <div className={`${inverted ? 'text-right' : ''}`}>
        <div className="text-16">{label}</div>
        <span className="text-graphite text-14">
          {prettifyNumber(usdAmount, true)}
        </span>
      </div>
    </div>
  );
};

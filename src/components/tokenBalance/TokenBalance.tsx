import BigNumber from 'bignumber.js';
import { prettifyNumber } from 'utils/helperFunctions';
import { TokenImage } from 'components/image/TokenImage';

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
      <TokenImage
        alt={`${symbol} Logo`}
        src={imgUrl}
        className="w-40 h-40 mr-10 !rounded-full"
      />
      <div className={`${inverted ? 'text-right' : ''}`}>
        <div className="text-16">{label}</div>
        <span className="text-secondary">
          {prettifyNumber(usdAmount, true)}
        </span>
      </div>
    </div>
  );
};

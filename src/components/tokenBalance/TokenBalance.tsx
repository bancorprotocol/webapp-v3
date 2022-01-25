import { Image } from 'components/image/Image';
import BigNumber from 'bignumber.js';
import { prettifyNumber } from 'utils/helperFunctions';

interface Props {
  label: string;
  amount: string;
  usdPrice: string;
  imgUrl: string;
}
export const TokenBalance = ({ label, amount, usdPrice, imgUrl }: Props) => {
  const usdAmount = new BigNumber(amount).times(usdPrice).toString();
  return (
    <div className="flex">
      <Image alt={`${label} Logo`} src={imgUrl} className="w-40 h-40 mr-10" />
      <div>
        <div>
          {label} {prettifyNumber(amount)}
        </div>
        <span className="text-graphite">{prettifyNumber(usdAmount, true)}</span>
      </div>
    </div>
  );
};

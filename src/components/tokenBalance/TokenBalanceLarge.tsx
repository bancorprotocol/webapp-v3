import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { TokenImage } from 'components/image/TokenImage';

interface Props {
  symbol: string;
  amount: string;
  usdPrice: string;
  logoURI: string;
  label?: string;
}

export const TokenBalanceLarge = ({
  symbol,
  amount,
  usdPrice,
  logoURI,
  label,
}: Props) => {
  const usdAmount = useMemo(
    () => new BigNumber(amount).times(usdPrice),
    [amount, usdPrice]
  );

  return (
    <div className="pb-10">
      {label && <div className="text-12 font-semibold mb-10">{label}</div>}
      <div className="flex items-center">
        <TokenImage
          alt={'Token Logo'}
          className="w-40 h-40 !rounded-full mr-10"
          src={logoURI}
        />
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="text-[36px]">{prettifyNumber(amount)}</div>
            <span className="ml-10">{symbol}</span>
          </div>

          <div className="text-secondary">
            {prettifyNumber(usdAmount, true)}
          </div>
        </div>
      </div>
    </div>
  );
};

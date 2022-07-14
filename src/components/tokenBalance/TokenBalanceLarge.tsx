import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Image } from 'components/image/Image';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';

interface Props {
  symbol: string;
  amount: string;
  usdPrice: string;
  logoURI: string;
  label?: string;
  deficitAmount?: string;
}

export const TokenBalanceLarge = ({
  symbol,
  amount,
  usdPrice,
  logoURI,
  label,
  deficitAmount,
}: Props) => {
  const usdAmount = useMemo(
    () => new BigNumber(amount).times(usdPrice),
    [amount, usdPrice]
  );

  return (
    <div className="pb-10">
      {label && <div className="mb-10 font-semibold text-12">{label}</div>}
      <div className="flex items-center">
        <Image
          alt={'Token Logo'}
          className="w-40 h-40 !rounded-full mr-10"
          src={logoURI}
        />
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="text-[36px]">{prettifyNumber(amount)}</div>
            <span className="mx-10">{symbol}</span>
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

          <div className="text-secondary">
            {prettifyNumber(usdAmount, true)}
          </div>
        </div>
      </div>
    </div>
  );
};

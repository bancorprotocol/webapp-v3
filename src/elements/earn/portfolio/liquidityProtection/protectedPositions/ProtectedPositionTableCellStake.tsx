import { PopoverV3 } from 'components/popover/PopoverV3';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
interface Props {
  tknAmount: string;
  symbol: string;
  usdAmount: string;
  deficitAmountTKN?: string;
  deficitAmountUSD?: string;
}
export const ProtectedPositionTableCellAmount = ({
  tknAmount,
  symbol,
  usdAmount,
  deficitAmountTKN,
  deficitAmountUSD,
}: Props) => {
  const bnt = 'BNT' === symbol;
  return (
    <div>
      <div className="flex items-center h-24 font-medium gap-5">
        {tknAmount === '0' ? 'N/A' : `${prettifyNumber(tknAmount)} ${symbol}`}
        {false && deficitAmountTKN && deficitAmountUSD && !bnt && (
          <PopoverV3
            buttonElement={() => <IconWarning className="text-error" />}
          >
            <div>
              <div className="text-error">Available with Vault Deficit</div>
              <div className="flex items-center gap-10">
                {prettifyNumber(deficitAmountTKN ?? '')}
                <div className="text-secondary">
                  {prettifyNumber(deficitAmountUSD ?? '', true)}
                </div>
              </div>
            </div>
          </PopoverV3>
        )}
      </div>
      {usdAmount !== '0' && (
        <div className="mt-4 text-12 text-black-low dark:text-white-low">
          {prettifyNumber(usdAmount, true)} USD
        </div>
      )}
    </div>
  );
};

import { prettifyNumber } from 'utils/helperFunctions';
interface Props {
  tknAmount: string;
  symbol: string;
  usdAmount: string;
}
export const ProtectedPositionTableCellAmount = ({
  tknAmount,
  symbol,
  usdAmount,
}: Props) => {
  return (
    <div>
      <div className="flex items-center h-24 font-medium">
        {tknAmount === '0' ? 'N/A' : `${prettifyNumber(tknAmount)} ${symbol}`}
      </div>
      {usdAmount !== '0' && (
        <div className="mt-4 text-12 text-black-low dark:text-white-low">
          {prettifyNumber(usdAmount, true)} USD
        </div>
      )}
    </div>
  );
};

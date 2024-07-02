import { prettifyNumber } from 'utils/helperFunctions';

export const ProtectedPositionTableCellClaimable = ({
  tknAmount,
  usdAmount,
  symbol,
}: {
  tknAmount: string;
  usdAmount: string;
  symbol: string;
}) => {
  return (
    <div>
      <div className="flex items-center h-24 font-medium gap-5">
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

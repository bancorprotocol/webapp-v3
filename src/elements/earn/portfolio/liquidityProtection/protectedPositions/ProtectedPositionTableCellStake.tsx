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
    <div className="text-center">
      <div className="flex items-center justify-center font-medium h-24">
        {`${prettifyNumber(tknAmount)} ${symbol}`}
      </div>
      <div className="text-12 text-grey-4 mt-4">
        {prettifyNumber(usdAmount, true)} USD
      </div>
    </div>
  );
};

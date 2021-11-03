import { prettifyNumber } from 'utils/helperFunctions';

export const ProtectedPositionTableCellAmount = ({
  tknAmount,
  symbol,
  usdAmount,
}: any) => {
  return (
    <div>
      <div>{`${prettifyNumber(tknAmount)} ${symbol}`} </div>
      <div>{prettifyNumber(usdAmount, true)} USD</div>
    </div>
  );
};

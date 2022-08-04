import { ProgressBar } from 'components/progressBar/ProgressBar';

interface Props {
  outputBreakdown: { tkn: number; bnt: number };
  isBntToken: boolean;
  symbol: string;
}

export const V3WithdrawConfirmOutputBreakdown = ({
  outputBreakdown,
  isBntToken,
  symbol,
}: Props) => {
  return (
    <>
      {outputBreakdown.bnt > 0 && !isBntToken && (
        <div>
          <div className="font-semibold text-12">Output Breakdown</div>
          <ProgressBar
            percentage={outputBreakdown.tkn}
            className="text-primary"
          />
          <div className="flex justify-between">
            <div className="text-primary dark:text-white">
              {outputBreakdown.tkn.toFixed(2)}% {symbol}
            </div>
            <div className="text-secondary">
              {outputBreakdown.bnt.toFixed(2)}% BNT
            </div>
          </div>
        </div>
      )}
    </>
  );
};

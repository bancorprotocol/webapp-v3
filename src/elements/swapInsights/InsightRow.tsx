import { prettifyNumber } from 'utils/helperFunctions';
import { Speedometer } from './Speedometer';
import { IntoTheBlock } from 'services/api/intoTheBlock';
import { Token } from 'services/observables/tokens';
import { InsightCard } from 'elements/swapInsights/InsightCard';

export const InsightRow = ({
  token,
  data,
}: {
  token: Token;
  data: IntoTheBlock | null;
}) => {
  const cards = [
    data && data.inOutOfTheMoney
      ? {
          label: 'Holders making money at the current price',
          percentages: [
            { color: 'success', decPercent: data.inOutOfTheMoney.in },
            {
              color: 'grey-3',
              decPercent: data.inOutOfTheMoney.between,
            },
            { color: 'error', decPercent: data.inOutOfTheMoney.out },
          ],
        }
      : null,
    data && data.concentration
      ? {
          label: 'Concentration by large holders',
          percentages: [
            { color: 'primary', decPercent: data.concentration },
            { color: 'grey-3', decPercent: 1 - data.concentration },
          ],
        }
      : null,
    data && data.byTimeHeldComposition
      ? {
          label: 'Holders composition by time held',
          percentages: [
            {
              color: 'primary',
              decPercent: data.byTimeHeldComposition.cruiser,
            },
            {
              color: 'error',
              decPercent: data.byTimeHeldComposition.trader,
            },
            {
              color: 'success',
              decPercent: data.byTimeHeldComposition.hodler,
            },
          ],
        }
      : null,
  ];

  return (
    <div className="grid grid-cols-9 py-24 px-4 mt-10 gap-x-40 border-t">
      <div className="col-span-3">
        <Speedometer summary={data ? data.summary : null} />
      </div>
      <div className="col-span-6 grid grid-cols-3">
        <div className="flex items-center col-span-6">
          <img
            className="rounded-full h-32 w-32 bg-grey-2"
            src={token.logoURI}
            alt="Token Logo"
          />
          <div className="text-20 font-medium ml-10">{token.symbol}</div>
          <div className="text-14 ml-10">
            Price {prettifyNumber(token.usdPrice ?? 0, true)}
          </div>
        </div>
        <div className="h-full col-span-3 gap-8 grid grid-cols-3">
          {cards.map((card) => (
            <InsightCard data={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

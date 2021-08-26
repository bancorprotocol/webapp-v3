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
  data?: IntoTheBlock;
}) => {
  const cards = [
    data && data.inOutOfTheMoney
      ? {
          label: 'Holders making money at the current price',
          tooltip:
            'Shows what percentage of addresses holding this crypto-asset are making profits (in the money), breaking even (at the money) and losing money (out of the money) given the current market price.',
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
          tooltip:
            'The total holdings of whales and Investors that own more than 0.1% of the circulating supply',
          percentages: [
            { color: 'primary', decPercent: data.concentration },
            { color: 'grey-3', decPercent: 1 - data.concentration },
          ],
        }
      : null,
    data && data.byTimeHeldComposition
      ? {
          label: 'Holders composition by time held',
          tooltip:
            'Shows ownership distribution by time held. A Hodler (holding this crypto for over a year), a Cruiser (holding for more than a month but less than a year) or a Trader (holding for less than a month).',
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
    <div className="grid grid-cols-9 py-24 px-4 gap-x-40 border-t dark:border-blue-1">
      <div className="col-span-3">
        <Speedometer summary={data ? data.summary : null} />
      </div>
      <div className="flex flex-col justify-between col-span-6">
        <div className="flex items-center col-span-6">
          <img
            className="rounded-full h-20 w-20 bg-grey-2"
            src={token.logoURI}
            alt="Token Logo"
          />
          <div className="text-20 font-medium ml-5">{token.symbol}</div>
          <div className="text-14 ml-10">
            Price {prettifyNumber(token.usdPrice ?? 0, true)}
          </div>
        </div>
        <div className="h-[138px] col-span-3 gap-8 grid grid-cols-3">
          {cards.map((card, index) => (
            <InsightCard key={index} data={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

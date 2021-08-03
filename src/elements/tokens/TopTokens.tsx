import { Ticker } from 'components/Ticker';
import { useAppSelector } from '../../redux';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from '../../utils/helperFunctions';

export const TopTokens = () => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const topTokens = tokens.slice(0, 20);

  return (
    <section className="bg-white dark:bg-blue-4 md:rounded-20 pt-20 pb-10 shadow-widget">
      <h2 className="font-semibold ml-20">Top Tokens</h2>
      <hr className="my-14 mx-20 border-t-2 border-grey-2 dark:border-blue-1" />
      <Ticker id="top-tokens">
        <div className="flex space-x-16 mt-10">
          {topTokens.map((token) => (
            <div
              key={token.address}
              className="flex items-center justify-center min-w-[150px] h-[75px] rounded-[6px] bg-blue-0 dark:bg-blue-2 shadow-widget dark:shadow-none"
            >
              <img
                src={token.logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="w-50 h-50 rounded-full"
              />
              <div className="ml-10 text-12 dark:text-grey-3">
                <div className="font-medium">{token.symbol}</div>
                <div>{prettifyNumber(token.usdPrice ?? 0, true)}</div>
                <div className="font-bold text-success">+102.75%</div>
              </div>
            </div>
          ))}
        </div>
      </Ticker>
    </section>
  );
};

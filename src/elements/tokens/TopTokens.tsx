import { Ticker } from 'components/Ticker';
import { useAppSelector } from '../../redux';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from '../../utils/helperFunctions';

export const TopTokens = () => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const topTokens = tokens.slice(0, 20);

  return (
    <section className="bg-white rounded-20 py-10 shadow-widget">
      <h2 className="font-semibold mt-10 ml-20">Top Tokens</h2>
      <hr className="my-20" />
      <Ticker id="top-tokens">
        <div className="flex space-x-16">
          {topTokens.map((token) => (
            <div
              key={token.address}
              className="flex items-center justify-center min-w-[150px] h-[75px] rounded-[6px] bg-blue-0 shadow-widget"
            >
              <img
                src={token.logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="w-50 h-50 rounded-full"
              />
              <div className="ml-10 text-12">
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

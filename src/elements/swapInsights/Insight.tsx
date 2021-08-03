import { InsightRow } from './InsightRow';
import { ReactComponent as IconLightbulb } from 'assets/icons/lightbulb.svg';
import { ReactComponent as IconIntotheblock } from 'assets/icons/intotheblock.svg';
import { IntoTheBlock } from 'services/api/intoTheBlock';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';

export interface InsightToken extends IntoTheBlock {
  image: string;
  price: number;
}

interface InsightProps {
  fromToken: Token;
  toToken: Token | null;
}

export const Insight = ({ fromToken, toToken }: InsightProps) => {
  const fromTokenIntoBlock = useAppSelector<IntoTheBlock | null>(
    (state) => state.intoTheBlock.fromToken
  );
  const toTokenIntoBlock = useAppSelector<IntoTheBlock | null>(
    (state) => state.intoTheBlock.toToken
  );

  const [isExpanded, setIsExpanded] = useLocalStorage(
    'insightsExpanded',
    false
  );

  return (
    <div
      className={`hidden 2xl:block widget-large mx-auto overflow-hidden transition-all duration-1000 ease-in-out ${
        isExpanded ? 'max-w-full h-[633px]' : 'w-[57px] h-[57px]'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            className="flex justify-center items-center min-w-[57px] min-h-[57px]"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <IconLightbulb className="w-[17px] h-[24px]" />
          </button>
          <div className="text-20 font-semibold">Insights</div>
        </div>
        <div className="text-12 mr-20 flex items-center">
          <p className="mr-6">Powered by </p>
          <a
            className="flex items-center"
            href="https://app.intotheblock.com/?pid=bancor&utm_source=bancor_widget"
            target="_blank"
            rel="noreferrer"
          >
            <IconIntotheblock className="mr-6" />
            <span className="font-semibold">into</span>the
            <span className="font-semibold">block</span>
          </a>
          <button className="w-16 ml-12">
            <IconTimes onClick={() => setIsExpanded(!isExpanded)} />
          </button>
        </div>
      </div>
      <div className="px-20">
        {fromToken && (
          <InsightRow token={fromToken} data={fromTokenIntoBlock} />
        )}
        {toToken && <InsightRow token={toToken} data={toTokenIntoBlock} />}
      </div>
    </div>
  );
};

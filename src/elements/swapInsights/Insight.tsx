import { InsightRow } from './InsightRow';
import { ReactComponent as IconLightbulb } from 'assets/icons/lightbulb.svg';
import { ReactComponent as IconIntotheblock } from 'assets/icons/intotheblock.svg';
import { IntoTheBlock } from 'services/api/intoTheBlock';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { Token } from 'services/observables/tokens';
import { sendInsight } from 'services/api/googleTagManager';
import { Tooltip } from 'components/tooltip/Tooltip';
import { useState } from 'react';

export interface InsightToken extends IntoTheBlock {
  image: string;
  price: number;
}

interface InsightProps {
  fromToken: Token;
  toToken?: Token;
  fromTokenIntoBlock?: IntoTheBlock;
  toTokenIntoBlock?: IntoTheBlock;
}

export const Insight = ({
  fromToken,
  toToken,
  fromTokenIntoBlock,
  toTokenIntoBlock,
}: InsightProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage(
    'insightsExpanded',
    false
  );
  const [show, setShow] = useState(isExpanded);

  return (
    <div
      onTransitionEnd={() => setShow(isExpanded)}
      className={`hidden 2xl:block widget-large mx-auto overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-w-full h-[583px] w-[780px]' : 'w-[65px] h-[65px]'
      }`}
    >
      <div
        className={`flex justify-between items-center ${
          isExpanded ? 'mb-16 mx-24 mt-[26px]' : 'mx-24 my-20'
        }`}
      >
        <div className="flex items-center transition-none">
          {!isExpanded ? (
            <Tooltip
              onClick={() => {
                sendInsight(!isExpanded);
                setShow(!isExpanded);
                setIsExpanded(!isExpanded);
              }}
              button={<IconLightbulb className="w-[17px] h-[24px]" />}
              content={'Insight'}
            />
          ) : (
            <button
              onClick={() => {
                sendInsight(!isExpanded);
                setShow(!isExpanded);
                setIsExpanded(!isExpanded);
              }}
            >
              <IconLightbulb className="w-[17px] h-[24px]" />
            </button>
          )}
          <div
            className={`text-20 font-semibold ${
              isExpanded ? 'ml-10' : 'ml-30'
            }`}
          >
            Insights
          </div>
        </div>
        <div className="text-12 flex items-center">
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
            <IconTimes
              onClick={() => {
                sendInsight(!isExpanded);
                setShow(!isExpanded);
                setIsExpanded(!isExpanded);
              }}
            />
          </button>
        </div>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {show && (
          <div className="px-20">
            {fromToken && (
              <InsightRow token={fromToken} data={fromTokenIntoBlock} />
            )}
            {toToken && <InsightRow token={toToken} data={toTokenIntoBlock} />}
          </div>
        )}
      </div>
    </div>
  );
};

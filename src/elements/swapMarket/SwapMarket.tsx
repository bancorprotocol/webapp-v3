import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';

export const SwapMarketWidget = () => {
  return (
    <div className="widget mx-auto">
      <div className="flex justify-between text-grey-3 text-20 py-16 px-20">
        <div>
          <span className="text-blue-4 font-semibold dark:text-grey-0">
            Market
          </span>
          <span className="mx-20">|</span>
          <span>Limit</span>
        </div>
        <div>
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>

      <hr className="widget-separator" />

      <div className="px-20">
        <TokenInputField
          label="You Pay"
          balance={123.4567}
          balanceUsd={98.76}
          bgGrey
        />
      </div>

      <div className="widget-block mt-20">
        <div className="mx-10 mb-16">
          <TokenInputField
            label="You Receive"
            balance={123.4567}
            balanceUsd={98.76}
          />

          <div className="flex justify-between mt-15">
            <span>Rate</span>
            <span>1 BNT = 0.00155432 ETH</span>
          </div>

          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>0.2000%</span>
          </div>
        </div>

        <button className="btn-primary rounded w-full">Swap</button>
      </div>
    </div>
  );
};

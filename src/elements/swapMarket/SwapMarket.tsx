import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { ViewToken } from 'redux/bancorAPI/bancorAPI';
import { useAppSelector } from 'redux/index';

export const SwapMarket = () => {
  const tokens = useAppSelector<ViewToken[]>((state) => state.bancorAPI.tokens);

  return (
    <div>
      <div className="px-20">
        <TokenInputField
          label="You Pay"
          balance={123.4567}
          balanceUsd={98.76}
          initialToken={tokens[0]}
          border
          selectable
        />
      </div>

      <div className="widget-block mt-20">
        <div className="mx-10 mb-16">
          <TokenInputField
            label="You Receive"
            balance={123.4567}
            balanceUsd={98.76}
            initialToken={tokens[1]}
            selectable
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

import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';

interface Props {
  bnt: Token;
  tkn: Token;
  bntTknRate: string;
}

export const AddLiquidityDualTokenPrices = ({
  bnt,
  tkn,
  bntTknRate,
}: Props) => {
  const bntTknRateUsd = () => {
    return new BigNumber(tkn.usdPrice!).times(bntTknRate);
  };

  const rateString = () => {
    return `${prettifyNumber(bntTknRate)} ${tkn.symbol} (${prettifyNumber(
      bntTknRateUsd(),
      true
    )})`;
  };
  return (
    <div className="px-10 pt-10">
      <div className="mb-20 font-medium">Tokens prices</div>
      {[bnt, tkn].map((t) => (
        <div key={t.address} className="flex justify-between mt-5 text-20">
          <div>1 {t.symbol} = </div>
          <div className="text-grey dark:text-graphite">
            {prettifyNumber(t.usdPrice!, true)}
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-20 text-grey dark:text-graphite">
        <div>1 BNT ({prettifyNumber(bnt.usdPrice!, true)}) =</div>
        <div>{rateString()}</div>
      </div>
    </div>
  );
};

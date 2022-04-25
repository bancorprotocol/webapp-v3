import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { PoolToken } from 'services/observables/pools';

export const PoolTokensCellName = (poolToken: PoolToken) => {
  return (
    <div className="flex items-center">
      <div className="w-[50px] h-30">
        <TokensOverlap tokens={[poolToken.bnt.token, poolToken.tkn.token]} />
      </div>
      <div className="ml-5">{poolToken.tkn.token.symbol} Pool</div>
    </div>
  );
};

import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { PoolToken } from 'services/observables/tokens';

export const PoolTokensCellName = (poolToken: PoolToken) => {
  return (
    <div className="flex items-center">
      <TokensOverlap tokens={[poolToken.bnt.token, poolToken.tkn.token]} />
      <div className="ml-5">{poolToken.tkn.token.symbol} Pool</div>
    </div>
  );
};

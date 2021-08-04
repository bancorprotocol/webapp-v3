import { TopTokens } from 'elements/tokens/TopTokens';
import { TokenTable } from 'elements/tokens/TokenTable';

export const Tokens = () => {
  return (
    <div className="space-y-30">
      <TopTokens />
      <TokenTable />
    </div>
  );
};

import { TopMovers } from 'elements/tokens/TopMovers';
import { TokenTable } from 'elements/tokens/TokenTable';

export const Tokens = () => {
  return (
    <div className="space-y-30 max-w-[1140px] mx-auto bg-grey-1 dark:bg-blue-3">
      <TopMovers />
      <TokenTable />
    </div>
  );
};

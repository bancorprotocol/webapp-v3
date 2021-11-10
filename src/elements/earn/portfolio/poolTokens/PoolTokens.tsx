import { PoolTokensTable } from './poolTokensTable/PoolTokensTable';

export const PoolTokens = () => {
  return (
    <div className="space-y-30">
      <p className="pl-10 md:pl-0">Manage your Bancor pool tokens.</p>

      <PoolTokensTable />
    </div>
  );
};

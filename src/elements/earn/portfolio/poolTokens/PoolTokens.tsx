import { PoolTokensTable } from './poolTokensTable/PoolTokensTable';

export const PoolTokens = () => {
  return (
    <div className="space-y-30">
      <p>Manage your Bancor pool tokens.</p>

      <PoolTokensTable />
    </div>
  );
};

import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { PoolV3 } from 'services/observables/pools';
import { getStandardRewards } from 'store/portfolio/v3Portfolio';
import { prettifyNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';

export const AdminTknData = () => {
  const allTokens = useAppSelector<Token[]>((state) => state.bancor.allTokens);
  const allV3Pools = useAppSelector<PoolV3[]>((state) => state.pool.v3Pools);
  const userStandardRewardPrograms = useAppSelector(getStandardRewards);

  return (
    <div className="grid grid-cols-3 gap-20 text-left">
      <div className="space-y-20">
        <h2>All Tokens</h2>
        {allTokens
          .filter((x) => Number(x.balance) !== 0)
          .map((token) => (
            <div key={token.address}>
              <TokenBalance
                symbol={token.symbol}
                amount={token.balance || '0'}
                usdPrice={token.usdPrice}
                imgUrl={token.logoURI}
              />
              <div>Token ID: {token.address}</div>
            </div>
          ))}
      </div>

      <div className="space-y-20">
        <h2>All V3 Pools</h2>
        {allV3Pools.map((pool) => (
          <div key={pool.poolDltId}>
            <div className="font-semibold">{pool.name}</div>
            <div>Pool ID: {pool.poolDltId}</div>
            <div>Pool Token ID: {pool.poolTokenDltId}</div>
            <div>Staked Balance: {prettifyNumber(pool.stakedBalance.tkn)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-20">
        <h2>Your Joined Standard Reward Programs</h2>
        {userStandardRewardPrograms.map((group) => (
          <div key={group.groupId}>
            <div className="font-semibold">
              Reward Token: {group.groupPool.reserveToken.symbol}
              <br />
              Total Rewards:{' '}
              {shrinkToken(
                group.totalPendingRewards,
                group.groupPool.decimals
              )}{' '}
              {group.groupPool.reserveToken.symbol}
            </div>
            {group.rewards.map((item) => (
              <div className="mb-10" key={item.id}>
                <div>Program ID: {item.id}</div>
                <div>Pool {item.programPool.reserveToken.symbol}</div>
                <div>
                  Pending Reward:{' '}
                  {shrinkToken(
                    item.pendingRewardsWei,
                    group.groupPool.decimals
                  )}{' '}
                  {group.groupPool.reserveToken.symbol}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

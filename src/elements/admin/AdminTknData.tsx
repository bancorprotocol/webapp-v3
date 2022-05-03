import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { PoolV3 } from 'services/observables/pools';
import {
  getPortfolioHoldings,
  getStandardRewards,
} from 'store/portfolio/v3Portfolio';
import { prettifyNumber } from 'utils/helperFunctions';
import { utils } from 'ethers';
import { getAllStandardRewardPrograms } from 'store/bancor/bancor';

export const AdminTknData = () => {
  const allTokens = useAppSelector<Token[]>((state) => state.bancor.allTokens);
  const allV3Pools = useAppSelector<PoolV3[]>((state) => state.pool.v3Pools);
  const holdings = useAppSelector(getPortfolioHoldings);
  const userStandardRewardPrograms = useAppSelector(getStandardRewards);
  const allStandardRewardsPrograms = useAppSelector(
    getAllStandardRewardPrograms
  );

  return (
    <div className="grid grid-cols-3 text-left gap-20">
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
            <div>Funding Limit: {prettifyNumber(pool.fundingLimit)}</div>
            <div>Staked Balance: {prettifyNumber(pool.stakedBalance)}</div>
            <div>
              Trading Liquidity of TKN: {prettifyNumber(pool.tradingLiqTKN)}
            </div>
            <div>
              Trading Liquidity of BNT: {prettifyNumber(pool.tradingLiqBNT)}
            </div>
            <div>
              Vault Balance of TKN: {prettifyNumber(pool.tknVaultBalance)}
            </div>
            <div>Deposit Limit: {prettifyNumber(pool.depositLimit)}</div>
            <div>Trading Enabled: {pool.tradingEnabled ? 'Yes' : 'No'}</div>
            <div>Deposit Enabled: {pool.depositingEnabled ? 'Yes' : 'No'}</div>
          </div>
        ))}
      </div>

      <div className="space-y-20">
        <h2>Your Pool Token holdings</h2>
        {holdings.map((holding) => (
          <div key={holding.pool.poolDltId}>
            <div>{holding.pool.reserveToken.name}</div>
            <div>Pool Token Balance: {holding.poolTokenBalance}</div>
            <div>To underlying Token: {holding.tokenBalance}</div>
            {holding.standardStakingReward && (
              <div>
                <div>Standard Staking:</div>
                <div>
                  Pool Token staked:{' '}
                  {utils.formatUnits(
                    holding.standardStakingReward.poolTokenAmountWei,
                    18
                  )}
                </div>
                <div>
                  Token value:{' '}
                  {utils.formatUnits(
                    holding.standardStakingReward.tokenAmountWei,
                    holding.pool.decimals
                  )}
                </div>
                <div>Combined Token Value: {holding.combinedTokenBalance}</div>
              </div>
            )}
          </div>
        ))}

        <h2>Your Joined Standard Reward Programs</h2>
        {userStandardRewardPrograms.map((group) => (
          <div key={group.groupId}>
            <div className="font-semibold">
              Reward Token: {group.groupPool.reserveToken.symbol}
              <br />
              Total Rewards:{' '}
              {utils.formatUnits(
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
                  {utils.formatUnits(
                    item.pendingRewardsWei,
                    group.groupPool.decimals
                  )}{' '}
                  {group.groupPool.reserveToken.symbol}
                </div>
              </div>
            ))}
          </div>
        ))}

        <h2>All Standard Reward Programs</h2>
        {allStandardRewardsPrograms.map((reward) => (
          <div key={reward.id}>
            <div>Program ID: {reward.id}</div>
            <div>Pool: {reward.token?.symbol}</div>
            <div>Rewards Token: {reward.rewardsToken?.symbol}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

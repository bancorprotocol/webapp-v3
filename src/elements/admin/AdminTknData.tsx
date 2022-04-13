import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { PoolV3 } from 'services/observables/pools';
import { getPortfolioHoldings } from 'redux/portfolio/v3Portfolio';
import { prettifyNumber } from 'utils/helperFunctions';
import { utils } from 'ethers';

export const AdminTknData = () => {
  const allTokens = useAppSelector<Token[]>((state) => state.bancor.allTokens);
  const allV3Pools = useAppSelector<PoolV3[]>((state) => state.pool.v3Pools);
  const holdings = useAppSelector(getPortfolioHoldings);

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
          <div key={pool.pool_dlt_id}>
            <div className="font-semibold">{pool.name}</div>
            <div>Pool ID: {pool.pool_dlt_id}</div>
            <div>Pool Token ID: {pool.poolToken_dlt_id}</div>
            <div>Funding Limit: {prettifyNumber(pool.fundingLimit)}</div>
            <div>Pool Liquidity: {prettifyNumber(pool.poolLiquidity)}</div>
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
          <div key={holding.poolId}>
            <div>{holding.token.name}</div>
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
                    holding.token.decimals
                  )}
                </div>
                <div>Combined Token Value: {holding.combinedTokenBalance}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

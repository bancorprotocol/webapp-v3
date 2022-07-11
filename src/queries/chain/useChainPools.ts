import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useChainTokenSymbol } from 'queries/chain/useChainTokenSymbol';
import { useChainTokenDecimals } from 'queries/chain/useChainTokenDecimals';
import { useChainTokenName } from 'queries/chain/useChainTokenName';
import { useChainTradingEnabled } from 'queries/chain/useChainTradingEnabled';
import { useChainPoolTokenIds } from 'queries/chain/useChainPoolTokenIds';
import { useChainTradingLiquidity } from 'queries/chain/useChainTradingLiquidity';
import { utils } from 'ethers';
import { useChainDepositingEnabled } from 'queries/chain/useChainDepositingEnabled';
import { useChainStakedBalance } from 'queries/chain/useChainStakedBalance';
import { PoolV3Chain } from 'queries/useV3ChainData';
import { useChainTradingFee } from 'queries/chain/useChainTradingFee';

export const useChainPools = () => {
  const poolIds = useChainPoolIds();
  const symbols = useChainTokenSymbol();
  const decimals = useChainTokenDecimals();
  const name = useChainTokenName();
  const tradingEnabled = useChainTradingEnabled();
  const poolTokens = useChainPoolTokenIds();
  const tradingLiquidity = useChainTradingLiquidity();
  const depositingEnabled = useChainDepositingEnabled();
  const stakedBalance = useChainStakedBalance();
  const tradingFee = useChainTradingFee();

  const isLoading =
    poolIds.isLoading ||
    symbols.isLoading ||
    decimals.isLoading ||
    tradingEnabled.isLoading ||
    poolTokens.isLoading ||
    tradingLiquidity.isLoading ||
    depositingEnabled.isLoading ||
    stakedBalance.isLoading ||
    tradingFee.isLoading ||
    name.isLoading;

  const isFetching =
    poolIds.isFetching ||
    symbols.isFetching ||
    decimals.isFetching ||
    tradingEnabled.isFetching ||
    poolTokens.isFetching ||
    tradingLiquidity.isFetching ||
    depositingEnabled.isFetching ||
    stakedBalance.isFetching ||
    tradingFee.isFetching ||
    name.isFetching;

  const error =
    poolIds.error ||
    symbols.error ||
    decimals.error ||
    name.error ||
    tradingEnabled.error ||
    tradingLiquidity.error ||
    depositingEnabled.error ||
    stakedBalance.error ||
    tradingFee.error ||
    poolTokens.error;

  const _buildPool = (id: string): PoolV3Chain | undefined => {
    if (
      !poolIds.data ||
      !symbols.data ||
      !decimals.data ||
      !name.data ||
      !tradingEnabled.data ||
      !tradingLiquidity.data ||
      !depositingEnabled.data ||
      !stakedBalance.data ||
      !tradingFee.data ||
      !poolTokens.data
    ) {
      return undefined;
    }

    const tokenDecimals = decimals.data.get(id)!;
    const tokenTradingLiquidity = tradingLiquidity.data.get(id)!;

    const pool: PoolV3Chain = {
      poolDltId: id,
      poolTokenDltId: poolTokens.data.get(id)!,
      symbol: symbols.data.get(id)!,
      decimals: tokenDecimals,
      name: name.data.get(id)!,
      tradingFeePPM: tradingFee.data.get(id)!,
      tradingEnabled: tradingEnabled.data.get(id)!,
      depositingEnabled: depositingEnabled.data.get(id)!,
      tradingLiquidity: {
        BNT: {
          bnt: utils.formatUnits(
            tokenTradingLiquidity.bntTradingLiquidity,
            tokenDecimals
          ),
          tkn: utils.formatUnits(tokenTradingLiquidity.bntTradingLiquidity, 18),
        },
        TKN: {
          tkn: utils.formatUnits(
            tokenTradingLiquidity.baseTokenTradingLiquidity,
            tokenDecimals
          ),
        },
      },
      stakedBalance: {
        tkn: utils.formatUnits(stakedBalance.data.get(id)!, tokenDecimals),
      },
      programs: [],
      logoURI:
        'https://d1wmp5nysbq9xl.cloudfront.net/ethereum/tokens/' +
        id.toLowerCase() +
        '.svg',
    };
    return pool;
  };

  const getPoolByID = (id: string) => _buildPool(id);

  return { isLoading, error, isFetching, getPoolByID };
};

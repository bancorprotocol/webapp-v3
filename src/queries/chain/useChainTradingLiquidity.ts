import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import {
  buildMulticallTradingLiquidity,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { TradingLiquidityStructOutput } from 'services/web3/abis/types/BancorNetworkInfo';
import { useChainTokenDecimals } from 'queries/chain/useChainTokenDecimals';
import { utils } from 'ethers';

interface Props {
  enabled?: boolean;
}

export const useChainTradingLiquidity = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const { data: decimals } = useChainTokenDecimals({ enabled });

  const query = useQuery(
    QueryKey.chainCoreTradingLiquidity(poolIds?.length),
    () =>
      fetchMulticallHelper<TradingLiquidityStructOutput>(
        poolIds!,
        buildMulticallTradingLiquidity
      ),
    queryOptionsStaleTimeLow(!!poolIds && enabled)
  );

  const getTradingLiquidityByID = (id: string) => {
    const dec = decimals?.get(id);
    const liq = query.data?.get(id);
    if (!liq || !dec) {
      // TODO error handling
      return undefined;
    }

    return {
      BNT: {
        bnt: utils.formatUnits(liq.bntTradingLiquidity, dec),
        tkn: utils.formatUnits(liq.bntTradingLiquidity, 18),
      },
      TKN: {
        tkn: utils.formatUnits(liq.baseTokenTradingLiquidity, dec),
      },
    };
  };

  return { ...query, getTradingLiquidityByID };
};

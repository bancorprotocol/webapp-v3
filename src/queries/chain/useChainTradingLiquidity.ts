import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import {
  buildMulticallTradingLiquidity,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { TradingLiquidityStructOutput } from 'services/web3/abis/types/BancorNetworkInfo';
import { useChainDecimals } from 'queries/chain/useChainDecimals';
import { utils } from 'ethers';
import { bntToken } from 'services/web3/config';
import { useApiBnt } from 'queries/api/useApiBnt';

interface Props {
  enabled?: boolean;
}

export const useChainTradingLiquidity = ({ enabled = true }: Props = {}) => {
  const { data: poolIds } = useChainPoolIds();
  const { data: decimals } = useChainDecimals({ enabled });
  const { data: bnt } = useApiBnt({ enabled });

  const query = useQuery(
    QueryKey.chainTradingLiquidity(poolIds?.length),
    () =>
      fetchMulticallHelper<TradingLiquidityStructOutput>(
        poolIds!.filter((id) => id !== bntToken),
        buildMulticallTradingLiquidity
      ),
    queryOptionsStaleTimeLow(!!poolIds && enabled)
  );

  const _getBNT = () => {
    if (!bnt) {
      return undefined;
    }

    return {
      BNT: {
        ...bnt.tradingLiquidity,
        tkn: bnt.tradingLiquidity.bnt,
      },
      TKN: {
        tkn: '0',
      },
    };
  };

  const getByID = (id: string) => {
    if (id === bntToken) {
      return _getBNT();
    }
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

  return { ...query, getByID };
};

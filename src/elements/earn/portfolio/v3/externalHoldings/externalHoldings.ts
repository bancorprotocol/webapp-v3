import { Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  ApyVisionData,
  ApyVisionNonUniPosition,
  ApyVisionNonUniPositionToken,
  ApyVisionNonUniResponse,
  ApyVisionUniPosition,
  ExternalHolding,
} from './externalHoldings.types';
import { utils } from 'ethers';
import { ethToken, wethToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';

const fetchApyVisionUniswap = async (
  user: string
): Promise<ApyVisionUniPosition[]> => {
  // eslint-disable-next-line
  const url = `https://stats.apy.vision/api/v1/uniswapv3/user_positions/${user}?accessToken=${process.env.REACT_APP_APY_VISION_TOKEN}`;
  try {
    // TODO remove comment when uni v3 is supported - further adjustemnts may be needed
    // const { data } = await axios.get<ApyVisionUniResponse>(url);
    // return data.result;
    return [];
    // eslint-disable-next-line no-unreachable
  } catch (e: any) {
    console.error('fetchApyVisionUniswap failed: ', e.message);
    return [];
  }
};

const fetchApyVisionNonUniswap = async (
  user: string
): Promise<ApyVisionNonUniPosition[]> => {
  const url = `https://api.apy.vision/portfolio/1/core/${user}?accessToken=${process.env.REACT_APP_APY_VISION_TOKEN}&isInWallet=true`;
  try {
    const { data } = await axios.get<ApyVisionNonUniResponse>(url);
    return data.userPools;
  } catch (e: any) {
    console.error('fetchApyVisionNonUniswap failed: ', e.message);
    return [];
  }
};

export const fetchExternalHoldings = async (
  user: string
): Promise<ApyVisionData> => {
  const positionsUni = await fetchApyVisionUniswap(user);
  const positionsNonUni = await fetchApyVisionNonUniswap(user);
  return { positionsUni, positionsNonUni };
};

const REKT_STATUS_THRESHOLD = -50;
const getRektStatus = (usdValue: number, hodlValue: number): string => {
  const rektUsdValue = new BigNumber(usdValue).minus(hodlValue);
  const rektAtRisk = new BigNumber(rektUsdValue).lt(REKT_STATUS_THRESHOLD);
  return rektAtRisk ? prettifyNumber(rektUsdValue.times(-1), true) : 'At risk';
};

export enum AMMProvider {
  UniswapV2 = 'uniswap_eth',
  UniswapV3 = 'uniswapv3_eth',
  Sushiswap = 'sushiswap_eth',
}

const getProviderName = (key: AMMProvider): string | undefined => {
  switch (key) {
    case AMMProvider.Sushiswap:
      return 'Sushiswap';
    case AMMProvider.UniswapV2:
      return 'Uniswap V2';
    case AMMProvider.UniswapV3:
      return 'Uniswap V3';
    // TODO remove comments once supported
    // case 'balancerv2_eth':
    //   return 'Balancer V2';
    // case 'oneinch_eth':
    //   return '1inch';
    // case 'balancer_eth':
    //   return 'Balancer V2';
    // case 'kyber_eth':
    //   return 'Kyber';
    // case 'curve_eth':
    //   return 'Curve';
    default:
      return undefined;
  }
};

export const getExternalHoldingsUni = (
  positions: ApyVisionUniPosition[],
  tokensMap: Map<string, Token>
): ExternalHolding[] => {
  return positions
    .map((pos) => {
      const token0 = tokensMap.get(utils.getAddress(pos.token0_id));
      const token1 = tokensMap.get(utils.getAddress(pos.token1_id));
      if (!token0 && !token1) {
        return undefined;
      }
      const tokens = [token0, token1].filter((t) => !!t) as Token[];
      const usdValue = pos.current_day_data.position_usd_value_at_block;
      const rektStatus = getRektStatus(
        usdValue,
        pos.current_day_data.hodl_value
      );
      const ammName = 'Uniswap V3';
      const externalHolding: ExternalHolding = {
        ammKey: AMMProvider.UniswapV3,
        ammName,
        tokens,
        rektStatus,
        usdValue,
        // TODO add poolTokenAddress
        poolTokenAddress: '',
        poolTokenBalanceWei: '',
        name: '',
      };
      return externalHolding;
    })
    .filter((pos) => !!pos) as ExternalHolding[];
};

export const getExternalHoldingsNonUni = (
  positions: ApyVisionNonUniPosition[],
  tokensMap: Map<string, Token>
): ExternalHolding[] => {
  return (
    positions
      // TODO Remove this filter once we support more than 2 reseves
      .filter((pos) => pos.tokens.length === 2)
      .map((pos) => {
        let nonBancorToken: ApyVisionNonUniPositionToken | undefined =
          undefined;
        const tokens = pos.tokens
          .map((token) => {
            const address = utils.getAddress(token.tokenAddress);
            const isETH = address === utils.getAddress(wethToken);
            const tkn = tokensMap.get(isETH ? ethToken : address);
            if (!tkn) {
              nonBancorToken = token;
              return undefined;
            }
            if (isETH) {
              return {
                ...tkn,
                address: wethToken,
                balance: token.tokenCurrentBalance.toString(),
              } as Token;
            }
            return {
              ...tkn,
              balance: token.tokenCurrentBalance.toString(),
            } as Token;
          })
          .filter((t) => !!t) as Token[];

        if (tokens.length === 0) {
          return undefined;
        }

        const usdValue = pos.totalValueUsd;
        const rektStatus = getRektStatus(usdValue, pos.initialCapitalValueUsd);

        const ammName = getProviderName(pos.poolProviderKey);
        if (!ammName) {
          return undefined;
        }
        const poolTokenBalanceWei = utils
          .parseUnits(pos.currentOwnedLpTokens.toString(), 18)
          .toString();

        const newPos: ExternalHolding = {
          ammKey: pos.poolProviderKey,
          ammName,
          tokens,
          nonBancorToken,
          rektStatus,
          usdValue,
          poolTokenAddress: pos.address,
          poolTokenBalanceWei,
          name: pos.name,
        };
        return newPos;
      })
      .filter((pos) => !!pos) as ExternalHolding[]
  );
};

export const getMigrateFnByAmmProvider = (ammKey: AMMProvider) => {
  switch (ammKey) {
    case AMMProvider.Sushiswap:
      return ContractsApi.BancorPortal.write.migrateSushiSwapV1Position;
    case AMMProvider.UniswapV2:
      return ContractsApi.BancorPortal.write.migrateUniswapV2Position;
  }
};

import {
  buildNetworkContract,
  conversionPath,
  getRateByPath,
  getReturnByPath,
} from 'services/web3/contracts/network/wrapper';
import { web3, writeWeb3 } from 'services/web3/contracts';
import {
  bancorNetwork$,
  contractAddresses$,
  liquidityProtectionStore$,
  settingsContractAddress$,
  stakingRewards$,
} from 'services/observables/contracts';
import {
  filter,
  map,
  share,
  startWith,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { TokenListItem } from 'services/observables/tokens';
import {
  expandToken,
  mapIgnoreThrown,
  shrinkToken,
  updateArray,
} from 'utils/pureFunctions';
import {
  ethToken,
  getNetworkVariables,
  wethToken,
  zeroAddress,
} from '../config';
import BigNumber from 'bignumber.js';
import { apiData$, apiTokens$ } from 'services/observables/pools';
import { currentNetwork$, networkVars$ } from 'services/observables/network';
import { partition, uniqWith, zip } from 'lodash';
import _ from 'lodash';
import wait from 'waait';
import { combineLatest, Subject } from 'rxjs';
import { fromWei, toWei } from 'web3-utils';
import { EthNetworks } from '../types';
import { buildTokenContract } from '../contracts/token/wrapper';
import {
  buildLiquidityProtectionSettingsContract,
  buildLiquidityProtectionStoreContract,
  buildStakingRewardsContract,
  buildStakingRewardsStoreContract,
} from '../contracts/swap/wrapper';
import { WelcomeData } from 'services/api/bancor';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { buildConverterContract } from '../contracts/converter/wrapper';
import { DataTypes, MultiCall } from 'eth-multicall';
import { multi } from '../contracts/shapes';
import axios, { AxiosResponse } from 'axios';
import { resolveTxOnConfirmation } from 'services/web3/index';

export const getRate = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
): Promise<string> => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const path = await conversionPath({
    from: fromToken.address === wethToken ? ethToken : fromToken.address,
    to: toToken.address === wethToken ? ethToken : toToken.address,
    networkContractAddress,
    web3,
  });

  const fromAmountWei = expandToken(amount, fromToken.decimals);
  const toAmountWei = await getRateByPath({
    networkContractAddress,
    amount: fromAmountWei,
    path,
    web3,
  });

  return shrinkToken(toAmountWei, toToken.decimals);
};

export const getPriceImpact = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
) => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();
  const amountWei = expandToken(amount, fromToken.decimals);

  const path = await conversionPath({
    from: fromToken.address,
    to: toToken.address,
    networkContractAddress,
    web3,
  });

  const result = await getReturnByPath({
    networkContractAddress,
    amount: amountWei,
    path,
    web3,
  });

  const pathInverted = await conversionPath({
    from: toToken.address,
    to: fromToken.address,
    networkContractAddress,
    web3,
  });

  const resultInverted = await getReturnByPath({
    networkContractAddress,
    amount: result['0'],
    path: pathInverted,
    web3,
  });

  const output = Number(resultInverted['0']);
  const input = Number(amountWei);

  return ((1 - output / input) * 100) / 2;
};

// const buildRate = (amountEntered: BigNumber, returnAmount: BigNumber) =>
//   returnAmount.div(amountEntered);

// const calculateSlippage = (
//   slippageLessRate: BigNumber,
//   slippagedRate: BigNumber
// ): BigNumber => {
//   if (slippagedRate.gt(slippageLessRate)) throw new Error('Rates are bad');
//   const result = slippageLessRate.minus(slippagedRate).abs();
//   return result.div(slippageLessRate);
// };

// const getReturn = async (
//   fromToken: TokenListItem,
//   toToken: TokenListItem,
//   amount: string
// ): Promise<ConvertReturn> => {
//   const apiData = await apiData$.pipe(take(1)).toPromise();
//   const minimalRelays = await winningMinimalRelays(apiData, allViewRelays);
//   const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();
//   const fromWei = expandToken(amount, fromToken.decimals);

//   const relays = await findBestPath({
//     fromId: fromToken.address,
//     toId: toToken.address,
//     relays: minimalRelays,
//     allViewRelays,
//   });

//   minimalPoolBalanceReceiver$.next(
//     relays.map(
//       (relay): MinimalPool => ({
//         anchorAddress: relay.anchorAddress,
//         converterAddress: relay.contract,
//         reserves: relay.reserves.map((r) => r.contract),
//       })
//     )
//   );

//   const wholePath = generateEthPath(fromToken.symbol, relays);
//   const path = wholePath.path;

//   const sortedPools = wholePath.sortedRelays.map((relay) => {
//     const pool = findOrThrow(apiData!.pools, (pool) =>
//       compareString(pool.pool_dlt_id, relay.anchorAddress)
//     );

//     const updatedReserves = sortAlongSide(
//       pool.reserves,
//       (reserve) => reserve.address,
//       relay.reserves.map((r) => r.contract)
//     );
//     return {
//       ...pool,
//       reserves: updatedReserves,
//     };
//   }, 'failed finding pools');

//   interface SpotPriceWithFee {
//     rate: string;
//     decFee: number;
//   }

//   const spotPrices = (sortedPools: Pool[]): SpotPriceWithFee[] =>
//     sortedPools.map((pool) => {
//       const [fromReserve, toReserve] = pool.reserves;
//       const rate = new BigNumber(toReserve.balance)
//         .div(fromReserve.balance)
//         .toString();

//       const decFee = ppmToDec(pool.fee);
//       return { rate, decFee };
//     });

//   const spotPriceReturn = (rates: SpotPriceWithFee[], amount: string) =>
//     rates.reduce((acc, item) => {
//       const spotReturn = new BigNumber(item.rate).times(acc);
//       const feeCharged = spotReturn.times(new BigNumber(1).minus(item.decFee));
//       return feeCharged;
//     }, new BigNumber(amount));

//   const calculateSpotPriceReturn = (
//     sortedPools: Pool[],
//     amount: string
//   ): BigNumber => {
//     const prices = spotPrices(sortedPools);
//     return spotPriceReturn(prices, amount);
//   };

//   try {
//     const slippageWeiReturn = await getRateByPath({
//       networkContractAddress,
//       path,
//       amount: fromWei,
//       web3,
//     });

//     const expectedReturnDec = shrinkToken(slippageWeiReturn, toToken.decimals);

//     const slippageLessReturn = calculateSpotPriceReturn(sortedPools, amount);
//     const slippageLessReturnRate = buildRate(
//       new BigNumber(amount),
//       slippageLessReturn
//     );
//     const userReturnRate = buildRate(
//       new BigNumber(amount),
//       new BigNumber(expectedReturnDec)
//     );

//     let slippage: number | undefined;
//     try {
//       const slippageBigNumber = calculateSlippage(
//         slippageLessReturnRate,
//         userReturnRate
//       );

//       const slippageNumber = slippageBigNumber.toNumber();
//       slippage = slippageNumber;
//     } catch (e) {
//       console.error('Failed calculating slippage', e.message);
//     }

//     return {
//       amount: shrinkToken(slippageWeiReturn, toToken.decimals),
//       slippage,
//     };
//   } catch (e) {
//     console.error(e, 'was caught in here...');
//     if (
//       e.message.includes(
//         `Returned values aren't valid, did it run Out of Gas? You might also see this error if you are not using the correct ABI for the contract you are retrieving data from`
//       )
//     ) {
//       const relayBalances = await Promise.all(
//         relays.map(async (relay) => ({
//           relay,
//           balances: relayBalances await fetchRelayBalances({
//             poolId: relay.anchorAddress,
//           }),
//         }))
//       );
//       const relaysWithNoBalances = relayBalances.filter(
//         (relay) =>
//           !relay.balances.reserves.every((reserve) => reserve.weiAmount !== '0')
//       );
//       if (relaysWithNoBalances.length > 0) {
//         const moreThanOne = relayBalances.length > 1;
//         throw new Error(
//           moreThanOne
//             ? 'Pool does not have sufficient reserve balances'
//             : 'Pool does not have a sufficient reserve balance'
//         );
//       } else {
//         throw new Error(e);
//       }
//     } else {
//       throw new Error(e);
//     }
//   }
// };

//Temporary

export const swap = async ({
  net,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  user,
  onConfirmation,
}: {
  net: EthNetworks;
  fromToken: TokenListItem;
  toToken: TokenListItem;
  fromAmount: string;
  toAmount: string;
  user: string;
  onConfirmation: Function;
}): Promise<string> => {
  currentNetwork = net;
  currentUser = user;
  const fromIsEth = fromToken.address === ethToken;
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const apiData = await apiData$.pipe(take(1)).toPromise();
  const minimalRelays = await winningMinimalRelays(apiData, allViewRelays);

  const fromWei = expandToken(fromAmount, fromToken.decimals);
  const relays = await findBestPath({
    relays: minimalRelays,
    fromId: fromToken.address,
    toId: toToken.address,
    allViewRelays,
  });

  const ethPath = generateEthPath(fromToken.symbol, relays);

  const networkContract = buildNetworkContract(
    networkContractAddress,
    writeWeb3
  );

  const expectedReturnWei = expandToken(toAmount, toToken.decimals);

  return resolveTxOnConfirmation({
    tx: networkContract.methods.convertByPath(
      ethPath.path,
      fromWei,
      await weiMinusSlippageTolerance(expectedReturnWei),
      zeroAddress,
      zeroAddress,
      0
    ),
    user: currentUser,
    onConfirmation: () => {
      onConfirmation();
    },
    resolveImmediately: true,
    ...(fromIsEth && { value: fromWei }),
  });
};

enum PoolType {
  Liquid = 0,
  Traditional = 1,
  ChainLink = 2,
}
interface MinimalRelay {
  contract: string;
  anchorAddress: string;
  reserves: TokenSymbol[];
}
interface TokenSymbol {
  contract: string;
  symbol: string;
}
interface ViewReserve {
  reserveId: string;
  id: string;
  logo: string[];
  symbol: string;
  contract: string;
}
interface ViewRelay {
  id: string;
  name: string;
  symbol: string;
  liqDepth: number;
  fee: number;
  reserves: ViewReserve[];
  addProtectionSupported: boolean;
  addLiquiditySupported: boolean;
  tradeSupported: boolean;
  removeLiquiditySupported: boolean;
  liquidityProtection: boolean;
  whitelisted: boolean;
  v2: boolean;
  feesGenerated?: string;
  feesVsLiquidity?: string;
  apr?: string;
  volume?: string;
  aprMiningRewards?: PoolLiqMiningApr;
  stakedBntSupplyPercent?: number;
}
interface PoolLiqMiningApr {
  poolId: string;
  endTime: number;
  rewards: LiqMiningApr[];
}
interface LiqMiningApr {
  symbol: string;
  address: string;
  amount: string;
  reward?: number;
}
interface TokenWithWeight extends Token {
  reserveWeight: number | undefined;
  reserveFeed?: ReserveFeed;
  meta?: {
    logo: string;
    name?: string;
  };
}
interface ReserveFeed {
  liqDepth: number;
  poolId: string;
  reserveAddress: string;
  costByNetworkUsd?: number;
  change24H?: number;
  volume24H?: number;
  priority: number;
}
interface Token {
  symbol: string;
  contract: string;
  decimals: number;
  network: string;
}
interface ConverterAndAnchor {
  converterAddress: string;
  anchorAddress: string;
}
interface PoolContainer {
  poolContainerAddress: string;
  poolTokens: PoolToken[];
}
interface PoolToken {
  reserveId: string;
  poolToken: Token;
}
interface NewPool extends Pool {
  reserveTokens: TokenMetaWithReserve[];
  decFee: number;
}
interface TokenMetaWithReserve extends TokenMeta {
  reserveWeight: number;
  decBalance: string;
}
interface TokenMeta {
  id: string;
  image: string;
  contract: string;
  symbol: string;
  name: string;
  precision?: number;
}
interface Reserve {
  address: string;
  weight: string;
  balance: string;
}
interface BntPrice {
  usd: null | string;
}
interface Pool {
  pool_dlt_id: string;
  converter_dlt_id: string;
  reserves: Reserve[];
  name: string;
  liquidity: BntPrice;
  volume_24h: BntPrice;
  fees_24h: BntPrice;
  fee: string;
  version: number;
  supply: string;
  decimals: number;
}
interface Relay {
  id: string;
  reserves: TokenWithWeight[];
  anchor: Anchor;
  contract: ContractAccount;
  isMultiContract: boolean;
  fee: number;
  network: string;
  version: string;
  converterType: PoolType;
}
interface RelayWithReserveBalances extends Relay {
  reserveBalances: { id: string; amount: string }[];
}
interface LiqDepth {
  liqDepth?: number;
}
interface ChainLinkRelay extends Relay {
  anchor: PoolContainer;
}
interface ViewRelayConverter extends ViewRelay {
  converterAddress: string;
}
interface Prompt {
  questions: {
    id: string;
    label: string;
  }[];
}
interface TokenWithdrawParam {
  owner: string;
  spender: string;
  tokenAddress: string;
  amount: string;
  currentApprovedBalance?: string;
}
interface ViewAmount {
  id: string;
  amount: string;
}
interface MinimalPool {
  anchorAddress: string;
  converterAddress: string;
  reserves: string[];
}
interface MinimalPoolWithReserveBalances extends MinimalPool {
  reserveBalances: ViewAmount[];
}
interface RawAbiReserveBalance {
  converterAddress: string;
  reserveOne: string;
  reserveOneAddress: string;
  reserveTwoAddress: string;
  reserveTwo: string;
}

type EosAccount = string;
type EthereumAddress = string;
type ContractAccount = EosAccount | EthereumAddress;
type SmartToken = Token;
type Anchor = SmartToken | PoolContainer;
type Edge = [string, string];
type AdjacencyList = Map<string, string[]>;
type Node = string;

let newPools: NewPool[] = [];
let apiDataa: WelcomeData;
let poolLiqMiningAprs: PoolLiqMiningApr[] = [];
let allViewRelays: ViewRelay[];
let currentNetwork = EthNetworks.Mainnet;
let currentUser = '';
let whiteListedPools: string[] = [];
const relaysList: readonly Relay[] = [];
const ORIGIN_ADDRESS = DataTypes.originAddress;

export const loadSwapInfo = async () => {
  apiDataa = await apiData$.pipe(take(1)).toPromise();

  newPools = await getNewPools(apiDataa, currentNetwork);

  allViewRelays = [...chainkLinkRelays, ...(await getRelays())]
    .sort(sortByLiqDepth)
    .sort(prioritiseV2Pools);

  apiData$.subscribe((data) => {
    const minimalPools = data.pools.map(
      (pool): MinimalPool => ({
        anchorAddress: pool.pool_dlt_id,
        converterAddress: pool.converter_dlt_id,
        reserves: pool.reserves.map((r) => r.address),
      })
    );
    minimalPoolBalanceReceiver$.next(minimalPools);
  });

  decimalReserveBalances$.subscribe((pools) => updateReserveBalances(pools));
  whitelistedPools$.subscribe((whitelistedPoolss) => {
    whiteListedPools = whitelistedPoolss;
  });
};

const getNewPools = async (
  apiData: WelcomeData,
  currentNetwork: EthNetworks
) => {
  //const tokenMeta = await getTokenMeta(currentNetwork).catch();
  const pools = apiData.pools;
  const tokens = apiData.tokens;

  const betterPools = pools.map((pool) => {
    const reserveTokens = pool.reserves.map((reserve): TokenMetaWithReserve => {
      const token = findOrThrow(
        tokens,
        (token) => compareString(token.dlt_id, reserve.address),
        'was expecting a token for a known reserve in API data'
      );

      return {
        id: reserve.address,
        contract: reserve.address,
        reserveWeight: ppmToDec(reserve.weight),
        decBalance: reserve.balance,
        name: token.symbol,
        symbol: token.symbol,
        image: defaultImage,
        precision: token.decimals,
      };
    });
    const decFee = ppmToDec(pool.fee);
    return {
      ...pool,
      decFee,
      reserveTokens,
    };
  });

  const passedPools = filterAndWarn(
    betterPools,
    (pool) => pool.reserveTokens.length === 2,
    'lost pools'
  ) as NewPool[];

  return passedPools.map(
    (pool): NewPool => ({
      ...pool,
      reserveTokens: pool.reserveTokens.map((reserve) => {
        return {
          ...reserve,
          image: defaultImage,
        };
      }),
    })
  );
};
const fetchWhiteListedV1Pools = async (
  liquidityProtectionSettingsAddress: string
) => {
  try {
    const liquidityProtection = buildLiquidityProtectionSettingsContract(
      liquidityProtectionSettingsAddress
    );
    const whitelistedPools = await liquidityProtection.methods
      .poolWhitelist()
      .call();

    return whitelistedPools;
  } catch (e) {
    throw new Error(
      `Failed fetching whitelisted pools with address ${liquidityProtectionSettingsAddress}`
    );
  }
};

const whitelistedPools$ = settingsContractAddress$.pipe(
  switchMapIgnoreThrow((address) => fetchWhiteListedV1Pools(address)),
  share()
);

const oneMillion = new BigNumber(1000000);
const defaultImage = 'https://ropsten.etherscan.io/images/main/empty-token.png';
const ppmToDec = (ppm: number | string): number =>
  new BigNumber(ppm).dividedBy(oneMillion).toNumber();

const newApiPools$ = apiData$.pipe(
  map((apiData) => {
    const pools = apiData.pools;
    const tokens = apiData.tokens;

    const betterPools = pools.map((pool) => {
      const reserveTokens = pool.reserves.map(
        (reserve): TokenMetaWithReserve => {
          const token = findOrThrow(
            tokens,
            (token) => compareString(token.dlt_id, reserve.address),
            'was expecting a token for a known reserve in API data'
          );

          return {
            id: reserve.address,
            contract: reserve.address,
            reserveWeight: ppmToDec(reserve.weight),
            decBalance: reserve.balance,
            name: token.symbol,
            symbol: token.symbol,
            image: defaultImage,
            precision: token.decimals,
          };
        }
      );
      const decFee = ppmToDec(pool.fee);
      return {
        ...pool,
        decFee,
        reserveTokens,
      };
    });

    const passedPools = filterAndWarn(
      betterPools,
      (pool) => pool.reserveTokens.length === 2,
      'lost pools'
    ) as NewPool[];

    return passedPools;
  })
);

const tokenMetaDataEndpoint =
  'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json';

const getTokenMeta = async (currentNetwork: EthNetworks) => {
  const networkVars = getNetworkVariables(currentNetwork);
  if (currentNetwork === EthNetworks.Ropsten) {
    return [
      {
        symbol: 'BNT',
        contract: networkVars.bntToken,
        precision: 18,
      },
      {
        symbol: 'DAI',
        contract: '0xc2118d4d90b274016cb7a54c03ef52e6c537d957',
        precision: 18,
      },
      {
        symbol: 'WBTC',
        contract: '0xbde8bb00a7ef67007a96945b3a3621177b615c44',
        precision: 8,
      },
      {
        symbol: 'BAT',
        contract: '0x443fd8d5766169416ae42b8e050fe9422f628419',
        precision: 18,
      },
      {
        symbol: 'LINK',
        contract: '0x20fe562d797a42dcb3399062ae9546cd06f63280',
        precision: 18,
      },
      {
        contract: '0x4F5e60A76530ac44e0A318cbc9760A2587c34Da6',
        symbol: 'YYYY',
      },
      {
        contract: '0x63B75DfA4E87d3B949e876dF2Cd2e656Ec963466',
        symbol: 'YYY',
      },
      {
        contract: '0xAa2A908Ca3E38ECEfdbf8a14A3bbE7F2cA2a1BE4',
        symbol: 'XXX',
      },
      {
        contract: '0xe4158797A5D87FB3080846e019b9Efc4353F58cC',
        symbol: 'XXX',
      },
    ].map(
      (x): TokenMeta => ({
        ...x,
        id: x.contract,
        image: defaultImage,
        name: x.symbol,
      })
    );
  }

  const res: AxiosResponse<TokenMeta[]> = await axios.get(
    tokenMetaDataEndpoint
  );

  const drafted = res.data
    .filter(({ symbol, contract, image }) =>
      [symbol, contract, image].every(Boolean)
    )
    .map((x) => ({ ...x, id: x.contract }));

  const existingEth = drafted.find((x) => compareString(x.symbol, 'eth'))!;

  const withoutEth = drafted.filter(
    (meta) => !compareString(meta.symbol, 'eth')
  );
  const addedEth = {
    ...existingEth,
    id: ethToken,
    contract: ethToken,
  };
  const final = [addedEth, existingEth, ...withoutEth];
  return uniqWith(final, (a, b) => compareString(a.id, b.id));
};

const tokenMeta$ = currentNetwork$.pipe(
  switchMapIgnoreThrow((network) => getTokenMeta(network)),
  share()
);
export const immediateTokenMeta$ = tokenMeta$.pipe(startWith(undefined));

const newPools$ = combineLatest([newApiPools$, immediateTokenMeta$]).pipe(
  map(([pools, tokenMeta]) =>
    pools.map(
      (pool): NewPool => ({
        ...pool,
        reserveTokens: pool.reserveTokens.map((reserve) => {
          const meta =
            tokenMeta &&
            tokenMeta.find((meta) =>
              compareString(meta.contract, reserve.contract)
            );

          return {
            ...reserve,
            image: (meta && meta.image) || defaultImage,
          };
        }),
      })
    )
  )
);

interface RewardShare {
  reserveId: string;
  rewardShare: string;
}

const storeRewards$ = stakingRewards$.pipe(
  switchMapIgnoreThrow((stakingRewardsContract) => {
    const contract = buildStakingRewardsContract(stakingRewardsContract);
    return contract.methods.store().call();
  }),
  share()
);

interface PoolProgram {
  poolToken: string;
  startTimes: string;
  endTimes: string;
  rewardRate: string;
  reserves: RewardShare[];
}

let poolPrograms: PoolProgram[] = [];

const fetchPoolPrograms = async (
  rewardsStoreContract?: string
): Promise<PoolProgram[]> => {
  if (poolPrograms) {
    return poolPrograms;
  }

  const storeContract =
    rewardsStoreContract ||
    (await buildStakingRewardsContract(
      (
        await contractAddresses$.pipe(take(1)).toPromise()
      ).StakingRewards
    )
      .methods.store()
      .call());
  try {
    const store = buildStakingRewardsStoreContract(storeContract);
    const result = await store.methods.poolPrograms().call();

    const poolProgram: PoolProgram[] = [];

    for (let i = 0; i < result[0].length; i++) {
      const reserveTokens = result[4][i];
      const rewardShares = result[5][i];
      const reservesTuple = zip(reserveTokens, rewardShares) as [
        string,
        string
      ][];
      const reserves: RewardShare[] = reservesTuple.map(
        ([reserveId, rewardShare]) => ({ reserveId, rewardShare })
      );

      poolProgram.push({
        poolToken: result[0][i],
        startTimes: result[1][i],
        endTimes: result[2][i],
        rewardRate: result[3][i],
        reserves,
      });
    }
    poolPrograms = poolProgram;

    return poolProgram;
  } catch (e) {
    throw new Error(
      `Failed fetching pool programs ${e.message} ${storeContract}`
    );
  }
};

const miningBntReward = (
  protectedBnt: string,
  rewardRate: string,
  rewardShare: number
) => {
  return new BigNumber(rewardRate)
    .multipliedBy(86400)
    .multipliedBy(2)
    .multipliedBy(rewardShare)
    .multipliedBy(365)
    .dividedBy(protectedBnt)
    .toNumber();
};
const miningTknReward = (
  tknReserveBalance: string,
  bntReserveBalance: string,
  protectedTkn: string,
  rewardRate: string,
  rewardShare: number
) => {
  return new BigNumber(rewardRate)
    .multipliedBy(86400)
    .multipliedBy(2)
    .multipliedBy(rewardShare)
    .multipliedBy(new BigNumber(tknReserveBalance).dividedBy(bntReserveBalance))
    .multipliedBy(365)
    .dividedBy(protectedTkn)
    .toNumber();
};
const protectedReservesShape = (
  storeAddress: string,
  anchorAddress: string,
  reserveOneAddress: string,
  reserveTwoAddress: string
) => {
  const contract = buildLiquidityProtectionStoreContract(storeAddress);
  return {
    anchorAddress,
    reserveOneAddress,
    reserveTwoAddress,
    reserveOneProtected: contract.methods.totalProtectedReserveAmount(
      anchorAddress,
      reserveOneAddress
    ),
    reserveTwoProtected: contract.methods.totalProtectedReserveAmount(
      anchorAddress,
      reserveTwoAddress
    ),
  };
};

const fetchPoolLiqMiningApr = async (
  multiCallAddress: string,
  poolPrograms: PoolProgram[],
  relays: MinimalPoolWithReserveBalances[],
  protectionStoreAddress: string,
  liquidityNetworkToken: string
) => {
  const ethMulti = new MultiCall(
    web3,
    multiCallAddress,
    [500, 300, 100, 50, 20, 1]
  );

  const highTierPools = relays.filter((relay) =>
    poolPrograms.some((poolProgram) =>
      compareString(relay.anchorAddress, poolProgram.poolToken)
    )
  );

  if (highTierPools.length === 0) return [];

  const storeAddress = protectionStoreAddress;

  const protectedShapes = highTierPools.map((pool) => {
    const [reserveOne, reserveTwo] = pool.reserveBalances;
    return protectedReservesShape(
      storeAddress,
      pool.anchorAddress,
      reserveOne.id,
      reserveTwo.id
    );
  });

  const [protectedReserves] = (await ethMulti.all([
    protectedShapes,
  ])) as unknown[] as {
    anchorAddress: string;
    reserveOneAddress: string;
    reserveTwoAddress: string;
    reserveOneProtected: string;
    reserveTwoProtected: string;
  }[][];

  const zippedProtectedReserves = protectedReserves.map((protectedReserve) => ({
    anchorAddress: protectedReserve.anchorAddress,
    reserves: [
      {
        contract: protectedReserve.reserveOneAddress,
        amount: protectedReserve.reserveOneProtected,
      },
      {
        contract: protectedReserve.reserveTwoAddress,
        amount: protectedReserve.reserveTwoProtected,
      },
    ],
  }));

  const res = zippedProtectedReserves.map((pool) => {
    const poolProgram: PoolProgram = findOrThrow(poolPrograms, (pp) =>
      compareString(pool.anchorAddress, pp.poolToken)
    );

    const poolReserveBalances = findOrThrow(highTierPools, (p) =>
      compareString(pool.anchorAddress, p.anchorAddress)
    );

    const networkToken = liquidityNetworkToken;

    const [bntReserve, tknReserve] = sortAlongSide(
      poolReserveBalances.reserveBalances,
      (reserve) => reserve.id,
      [networkToken]
    );

    const [bntProtected, tknProtected] = sortAlongSide(
      pool.reserves,
      (reserve) => reserve.contract,
      [networkToken]
    );

    const [bntProtectedShare, tknProtectedShare] = sortAlongSide(
      poolProgram.reserves,
      (reserve) => reserve.reserveId,
      [networkToken]
    );

    const poolRewardRate = poolProgram.rewardRate;

    const bntReward = miningBntReward(
      bntProtected.amount,
      poolRewardRate,
      ppmToDec(bntProtectedShare.rewardShare)
    );

    const tknReward = miningTknReward(
      tknReserve.amount,
      bntReserve.amount,
      tknProtected.amount,
      poolRewardRate,
      ppmToDec(tknProtectedShare.rewardShare)
    );

    return {
      ...pool,
      bntReward,
      tknReward,
      endTime: poolProgram.endTimes,
    };
  });

  const liqMiningApr = res.map((calculated) => {
    const [bntReserve, tknReserve] = sortAlongSide(
      calculated.reserves,
      (reserve) => reserve.contract,
      [liquidityNetworkToken]
    );

    return {
      poolId: calculated.anchorAddress,
      endTime: Number(calculated.endTime),
      rewards: [
        {
          address: bntReserve.contract,
          amount: bntReserve.amount,
          reward: calculated.bntReward,
        },
        {
          address: tknReserve.contract,
          amount: tknReserve.amount,
          reward: calculated.tknReward,
        },
      ],
    };
  });

  return liqMiningApr;
};

const poolPrograms$ = storeRewards$.pipe(
  switchMapIgnoreThrow((storeRewardContract) =>
    fetchPoolPrograms(storeRewardContract)
  ),
  share()
);

combineLatest([
  newPools$,
  apiTokens$,
  networkVars$,
  poolPrograms$,
  liquidityProtectionStore$,
])
  .pipe(
    switchMapIgnoreThrow(
      async ([
        pools,
        tokens,
        networkVars,

        poolPrograms,
        liquidityProtectionStore,
      ]) => {
        const minimalPools = pools.map(
          (pool): MinimalPoolWithReserveBalances => ({
            anchorAddress: pool.pool_dlt_id,
            converterAddress: pool.converter_dlt_id,
            reserves: pool.reserves.map((r) => r.address),
            reserveBalances: pool.reserves.map((reserve) => ({
              amount: expandToken(
                reserve.balance,
                findOrThrow(tokens, (token) =>
                  compareString(token.dlt_id, reserve.address)
                ).decimals
              ),
              id: reserve.address,
            })),
          })
        );
        const liquidityProtectionNetworkToken =
          getNetworkVariables(currentNetwork).bntToken;

        const liqApr = await fetchPoolLiqMiningApr(
          networkVars.multiCall,
          poolPrograms,
          minimalPools,
          liquidityProtectionStore,
          liquidityProtectionNetworkToken
        );

        const complementSymbols = liqApr.map(
          (apr): PoolLiqMiningApr => ({
            ...apr,
            rewards: apr.rewards.map((r) => ({
              ...r,
              symbol: findOrThrow(tokens, (token) =>
                compareString(token.dlt_id, r.address)
              ).symbol,
            })),
          })
        );

        return complementSymbols;
      }
    )
  )
  .subscribe((apr) => updateLiqMiningApr(apr));

const updateLiqMiningApr = (liqMiningApr: PoolLiqMiningApr[]) => {
  if (liqMiningApr.length === 0) return;
  const existing = poolLiqMiningAprs;
  const withoutOld = existing.filter(
    (apr) => !liqMiningApr.some((a) => compareString(a.poolId, apr.poolId))
  );
  poolLiqMiningAprs = [...withoutOld, ...liqMiningApr];
};

export const minimalPoolBalanceReceiver$ = new Subject<MinimalPool[]>();

const freshReserveBalances$ = minimalPoolBalanceReceiver$.pipe(
  switchMapIgnoreThrow((minimalPools) => getReserveBalances(minimalPools))
);

const reserveBalanceShape = (contractAddress: string, reserves: string[]) => {
  const contract = buildConverterContract(contractAddress);
  const [reserveOne, reserveTwo] = reserves;
  return {
    converterAddress: ORIGIN_ADDRESS,
    reserveOneAddress: reserveOne,
    reserveTwoAddress: reserveTwo,
    reserveOne: contract.methods.getConnectorBalance(reserveOne),
    reserveTwo: contract.methods.getConnectorBalance(reserveTwo),
  };
};

const getReserveBalances = async (
  relays: MinimalPool[]
): Promise<MinimalPoolWithReserveBalances[]> => {
  const [pools] = (await multi({
    groupsOfShapes: [
      relays.map((v1Pool) =>
        reserveBalanceShape(v1Pool.converterAddress, v1Pool.reserves)
      ),
    ],
    currentNetwork,
  })) as unknown[] as [RawAbiReserveBalance[]];

  const zipped = pools.map((pool) => ({
    reserves: [
      { id: pool.reserveOneAddress, amount: pool.reserveOne },
      { id: pool.reserveTwoAddress, amount: pool.reserveTwo },
    ],
    converterAddress: pool.converterAddress,
  }));

  return relays.map((relay): MinimalPoolWithReserveBalances => {
    const zippedPool = findOrThrow(
      zipped,
      (pool) => compareString(pool.converterAddress, relay.converterAddress),
      'failed to find zipped pool...'
    );
    return {
      ...relay,
      reserveBalances: sortAlongSide(
        zippedPool.reserves,
        (r) => r.id,
        relay.reserves
      ),
    };
  });
};
const filterAndWarn = <T>(
  arr: T[],
  conditioner: (item: T) => boolean,
  reason?: string
): T[] => {
  const [passed, dropped] = partition(arr, conditioner);
  if (dropped.length > 0) {
    console.warn(
      'Dropped',
      dropped,
      'items from array',
      reason ? `because ${reason}` : ''
    );
  }
  return passed;
};

const decimalReserveBalances$ = freshReserveBalances$.pipe(
  withLatestFrom(apiTokens$),
  map(([pools, tokens]) => {
    const poolsCovered = filterAndWarn(
      pools,
      (pool) =>
        pool.reserveBalances.every((balance) =>
          tokens.some((token) => compareString(balance.id, token.dlt_id))
        ),
      'lost reserve balances because it was not covered in API tokens'
    );

    return poolsCovered.map(
      (pool): MinimalPoolWithReserveBalances => ({
        ...pool,
        reserveBalances: pool.reserveBalances.map((reserveBalance) => {
          const token = findOrThrow(tokens, (token) =>
            compareString(token.dlt_id, reserveBalance.id)
          );
          return {
            ...reserveBalance,
            amount: shrinkToken(reserveBalance.amount, token.decimals),
          };
        }),
      })
    );
  })
);

const updateReserveBalances = async (
  pools: MinimalPoolWithReserveBalances[]
) => {
  newPools = updateArray(
    newPools,
    (pool) =>
      pools.some((p) => compareString(pool.pool_dlt_id, p.anchorAddress)),
    (pool) => {
      const newBalances = findOrThrow(pools, (p) =>
        compareString(p.anchorAddress, pool.pool_dlt_id)
      );
      return {
        ...pool,
        reserves: pool.reserves.map((reserve) => {
          const newBalance = findOrThrow(
            newBalances.reserveBalances,
            (balance) => compareString(balance.id, reserve.address)
          );
          return {
            ...reserve,
            balance: newBalance.amount,
          };
        }),
      };
    }
  );
  const apiData = await apiData$.pipe(take(1)).toPromise();
  apiDataa = {
    ...apiData,
    pools: updateArray(
      apiDataa!.pools,
      (pool) =>
        pools.some((p) => compareString(pool.pool_dlt_id, p.anchorAddress)),
      (pool) => {
        const newBalances = findOrThrow(pools, (p) =>
          compareString(p.anchorAddress, pool.pool_dlt_id)
        );
        return {
          ...pool,
          reserves: pool.reserves.map((reserve) => {
            const newBalance = findOrThrow(
              newBalances.reserveBalances,
              (balance) => compareString(balance.id, reserve.address)
            );
            return {
              ...reserve,
              balance: newBalance.amount,
            };
          }),
        };
      }
    ),
  };
};

const sortByLiqDepth = (a: LiqDepth, b: LiqDepth) => {
  if (a.liqDepth === undefined && b.liqDepth === undefined) return 0;
  if (a.liqDepth === undefined) return 1;
  if (b.liqDepth === undefined) return -1;
  if (isNaN(a.liqDepth) && isNaN(b.liqDepth)) return 0;
  if (isNaN(a.liqDepth)) return 1;
  if (isNaN(b.liqDepth)) return -1;
  return b.liqDepth - a.liqDepth;
};
const prioritiseV2Pools = (a: ViewRelay, b: ViewRelay) => {
  if (a.v2 && b.v2) return 0;
  if (!a.v2 && !b.v2) return 0;
  if (a.v2 && !b.v2) return -1;
  if (!a.v2 && b.v2) return 1;
  return 0;
};

const compareString = (stringOne: string, stringTwo: string): boolean => {
  const strings = [stringOne, stringTwo];
  if (!strings.every((str) => typeof str === 'string'))
    throw new Error(
      `String one: ${stringOne} String two: ${stringTwo} one of them are falsy or not a string`
    );
  return stringOne.toLowerCase() === stringTwo.toLowerCase();
};

const isChainLink = (relay: Relay): boolean =>
  Array.isArray((relay.anchor as PoolContainer).poolTokens) &&
  relay.converterType === PoolType.ChainLink;

const chainkLinkRelays: ViewRelay[] = (
  relaysList.filter(isChainLink) as ChainLinkRelay[]
)
  .filter((relay) =>
    relay.reserves.every((reserve) => reserve.reserveFeed && reserve.meta)
  )
  .map((relay) => {
    const [, tokenReserve] = relay.reserves;

    const { poolContainerAddress } = relay.anchor;

    const reserves = relay.reserves.map(
      (reserve) =>
        ({
          reserveWeight: reserve.reserveWeight,
          id: reserve.contract,
          reserveId: poolContainerAddress + reserve.contract,
          logo: [reserve.meta!.logo],
          symbol: reserve.symbol,
          contract: reserve.contract,
          smartTokenSymbol: poolContainerAddress,
        } as ViewReserve)
    );

    const bntTokenAddress = getNetworkVariables(currentNetwork).bntToken;
    const relayBalances = relay as RelayWithReserveBalances;
    const bntReserveBalance =
      relayBalances.reserveBalances?.find((reserve) =>
        compareString(reserve.id, bntTokenAddress)
      )?.amount || '0';

    const tradeSupported = relayBalances.reserveBalances.every(
      (balance) => balance.amount !== '0'
    );

    return {
      id: poolContainerAddress,
      tradeSupported,
      name: buildPoolNameFromReserves(reserves),
      version: Number(relay.version),
      reserves,
      fee: relay.fee,
      liqDepth: relay.reserves.reduce(
        (acc, item) => acc + item.reserveFeed!.liqDepth,
        0
      ),
      symbol: tokenReserve.symbol,
      addProtectionSupported: false,
      addLiquiditySupported: true,
      removeLiquiditySupported: true,
      whitelisted: false,
      liquidityProtection: false,
      bntReserveBalance: shrinkToken(bntReserveBalance, 18),
      v2: true,
    } as ViewRelay;
  });

const sortAlongSide = <T>(
  arr: readonly T[],
  selector: (item: T) => string,
  sortedArr: string[]
): T[] => {
  const res = arr.slice().sort((a, b) => {
    const aIndex = sortedArr.findIndex((sort) =>
      compareString(sort, selector(a))
    );
    const bIndex = sortedArr.findIndex((sort) =>
      compareString(sort, selector(b))
    );

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return res;
};

const fetchMinLiqForMinting = async (protectionSettingsContract: string) => {
  const contract = buildLiquidityProtectionSettingsContract(
    protectionSettingsContract,
    web3
  );

  const result = await contract.methods
    .minNetworkTokenLiquidityForMinting()
    .call();

  return new BigNumber(shrinkToken(result, 18));
};

const getRelays = async () => {
  const poolLiquidityMiningAprs = poolLiqMiningAprs;
  const limit = await fetchMinLiqForMinting(
    await settingsContractAddress$.pipe(take(1)).toPromise()
  );

  const liquidityProtectionNetworkToken =
    getNetworkVariables(currentNetwork).bntToken;

  return newPools.map((relay) => {
    const liqDepth = Number(relay.liquidity.usd);
    const tradeSupported = relay.reserves.every(
      (reserve) => reserve.balance !== '0'
    );

    const whitelisted = whiteListedPools.some((whitelistedAnchor) =>
      compareString(whitelistedAnchor, relay.pool_dlt_id)
    );
    const lpNetworkTokenReserve = relay.reserves.find((reserve) =>
      compareString(reserve.address, liquidityProtectionNetworkToken)
    );

    const hasEnoughLpNetworkToken =
      lpNetworkTokenReserve &&
      limit &&
      limit.isLessThan(lpNetworkTokenReserve!.balance);

    const liquidityProtection =
      relay.reserveTokens.some((reserve) =>
        compareString(reserve.contract, liquidityProtectionNetworkToken)
      ) &&
      relay.reserveTokens.length === 2 &&
      relay.reserveTokens.every((reserve) => reserve.reserveWeight === 0.5) &&
      whitelisted &&
      hasEnoughLpNetworkToken;

    const bntReserve = relay.reserves.find((reserve) =>
      compareString(reserve.address, liquidityProtectionNetworkToken)
    );
    const addProtectionSupported = liquidityProtection && bntReserve;

    const feesGenerated = relay.fees_24h.usd || 0;
    const feesVsLiquidity =
      liqDepth === 0
        ? '0'
        : new BigNumber(feesGenerated).times(365).div(liqDepth).toString();

    const volume = relay.volume_24h.usd;

    const aprMiningRewards = poolLiquidityMiningAprs.find((apr) =>
      compareString(apr.poolId, relay.pool_dlt_id)
    );

    const reserves = sortAlongSide(
      relay.reserveTokens.map(
        (reserve) =>
          ({
            id: reserve.contract,
            reserveWeight: reserve.reserveWeight,
            reserveId: relay.pool_dlt_id + reserve.contract,
            logo: [reserve.image],
            symbol: reserve.symbol,
            contract: reserve.contract,
            smartTokenSymbol: reserve.symbol,
          } as ViewReserve)
      ),
      (reserve) => reserve.contract,
      [liquidityProtectionNetworkToken]
    );

    return {
      id: relay.pool_dlt_id,
      tradeSupported,
      name: buildPoolNameFromReserves(reserves),
      reserves,
      addProtectionSupported,
      fee: relay.decFee,
      liqDepth,
      symbol: relay.name,
      addLiquiditySupported: true,
      removeLiquiditySupported: true,
      liquidityProtection,
      whitelisted,
      v2: false,
      volume,
      feesGenerated,
      feesVsLiquidity,
      aprMiningRewards,
    } as ViewRelay;
  });
};

const buildPoolNameFromReserves = (
  reserves: ViewReserve[],
  separator: string = '/'
): string => {
  const symbols = reserves.map((x) => x.symbol);
  return symbols.reverse().join(separator);
};
const viewRelayConverterToMinimal = (
  relay: ViewRelayConverter
): MinimalRelay => ({
  anchorAddress: relay.id,
  contract: relay.converterAddress,
  reserves: relay.reserves.map((reserve) => ({
    contract: reserve.id,
    symbol: reserve.symbol,
  })),
});

const winningMinimalRelays = async (
  apiData: WelcomeData,
  relays: ViewRelay[]
): Promise<MinimalRelay[]> => {
  const relaysWithBalances = apiData.pools.filter((pool) =>
    pool.reserves.every((reserve) => reserve.balance !== '0')
  );

  const relaysByLiqDepth = relays
    .sort(sortByLiqDepth)
    .filter((relay) =>
      relaysWithBalances.some((r) => compareString(relay.id, r.pool_dlt_id))
    );
  const winningRelays = uniqWith(relaysByLiqDepth, compareRelayByReserves);

  const relaysWithConverterAddress = winningRelays.map((relay) => {
    const apiRelay = findOrThrow(apiData.pools, (pool) =>
      compareString(pool.pool_dlt_id, relay.id)
    );
    return {
      ...relay,
      converterAddress: apiRelay.converter_dlt_id,
    };
  });

  const minimalRelays = relaysWithConverterAddress.map(
    viewRelayConverterToMinimal
  );
  return minimalRelays;
};

const compareRelayByReserves = (a: ViewRelay, b: ViewRelay) =>
  a.reserves.every((reserve) =>
    b.reserves.some((r) => compareString(reserve.contract, r.contract))
  );

const findOrThrow = <T>(
  arr: readonly T[],
  iteratee: (obj: T, index: number, arr: readonly T[]) => unknown,
  message?: string
) => {
  const res = arr.find(iteratee);
  if (!res)
    throw new Error(message || 'Failed to find object in find or throw');
  return res;
};

const compareEdge = (edge1: Edge, edge2: Edge) =>
  edge1.every((edge) => edge2.some((e) => compareString(edge, e)));

const buildAdjacencyList = (edges: Edge[], nodes: Node[]): AdjacencyList => {
  const adjacencyList = new Map();
  nodes.forEach((node) => adjacencyList.set(node, []));
  edges.forEach(([from, to]) => adjacencyList.get(from).push(to));
  edges.forEach(([from, to]) => adjacencyList.get(to).push(from));
  return adjacencyList;
};

const callbackDfs = (
  start: string,
  goal: string,
  adjacencyList: AdjacencyList,
  callBack: (stuff: any) => void,
  visited = new Set(),
  path: string[] = [start]
) => {
  visited.add(start);
  const destinations = adjacencyList.get(start)!;
  if (destinations.includes(goal)) {
    callBack([...path, goal]);
  }
  for (const destination of destinations) {
    if (!visited.has(destination)) {
      callbackDfs(destination, goal, adjacencyList, callBack, visited, [
        ...path,
        destination,
      ]);
    }
  }
};

const dfs = (
  fromId: string,
  toId: string,
  adjacencyList: AdjacencyList
): Promise<string[]> =>
  new Promise((resolve) => callbackDfs(fromId, toId, adjacencyList, resolve));

async function findNewPath<T>(
  fromId: string,
  toId: string,
  pools: T[],
  identifier: (pool: T) => Edge
) {
  const edges = _.uniqWith(pools.map(identifier), compareEdge);
  const nodes: Node[] = _.uniqWith(edges.flat(1), compareString);

  const adjacencyList = buildAdjacencyList(edges, nodes);
  const startExists = adjacencyList.get(fromId);
  const goalExists = adjacencyList.get(toId);

  if (!(startExists && goalExists))
    throw new Error(
      `Start ${fromId} or goal ${toId} does not exist in adjacency list`
    );

  const dfsResult = await dfs(fromId, toId, adjacencyList)!;
  if (!dfsResult || dfsResult.length === 0)
    throw new Error('Failed to find path');

  const hops = _.chunk(dfsResult, 2).map((tokenIds, index, arr) => {
    let searchAbleIds: string[];

    if (tokenIds.length < 2) {
      searchAbleIds = [arr[index - 1][1], tokenIds[0]];
    } else searchAbleIds = tokenIds;

    const accomodatingRelays = pools.filter((pool) => {
      const ids = identifier(pool);
      return ids.every((id) => searchAbleIds.some((i) => id === i));
    });

    return accomodatingRelays;
  });

  return {
    path: dfsResult,
    hops,
  };
}

const findPath = async ({
  fromId,
  toId,
  relays,
}: {
  fromId: string;
  toId: string;
  relays: readonly MinimalRelay[];
}): Promise<MinimalRelay[]> => {
  const lowerCased = relays.map((relay) => ({
    ...relay,
    reserves: relay.reserves.map((reserve) => ({
      ...reserve,
      contract: reserve.contract.toLowerCase(),
    })),
  }));
  const path = await findNewPath(
    fromId.toLowerCase(),
    toId.toLowerCase(),
    lowerCased,
    (relay) => [relay.reserves[0].contract, relay.reserves[1].contract]
  );

  const flattened = path.hops.flatMap((hop) => hop[0]);
  return flattened.map((flat) =>
    findOrThrow(
      relays,
      (relay) => compareString(relay.contract, flat.contract),
      'failed to find relays used in pathing'
    )
  );
};

const throwAfter = async (
  milliseconds: number,
  errorMessage?: string
): Promise<never> => {
  await wait(milliseconds);
  throw new Error(errorMessage || 'Timeout');
};

const findBestPath = async ({
  fromId,
  toId,
  relays,
  allViewRelays,
}: {
  fromId: string;
  toId: string;
  relays: readonly MinimalRelay[];
  allViewRelays: ViewRelay[];
}): Promise<MinimalRelay[]> => {
  const possibleStartingRelays = relays.filter((relay) =>
    relay.reserves.some((reserve) => compareString(reserve.contract, fromId))
  );
  const moreThanOneReserveOut = possibleStartingRelays.length > 1;
  const onlyOneHopNeeded = relays.some((relay) =>
    [fromId, toId].every((id) =>
      relay.reserves.some((reserve) => compareString(reserve.contract, id))
    )
  );
  const fromIsBnt = compareString(
    fromId,
    (await networkVars$.pipe(take(1)).toPromise()).bntToken
  );
  const checkMultiplePaths =
    moreThanOneReserveOut && !onlyOneHopNeeded && !fromIsBnt;

  const apiData = apiDataa;

  if (checkMultiplePaths) {
    const fromSymbol = findOrThrow(
      apiData.tokens,
      (token) => compareString(token.dlt_id, fromId),
      'failed finding token....'
    ).symbol;
    const excludedRelays = relays.filter(
      (relay) =>
        !possibleStartingRelays.some((r) =>
          compareString(r.anchorAddress, relay.anchorAddress)
        )
    );

    const results = await mapIgnoreThrown(
      possibleStartingRelays,
      async (startingRelay) => {
        const isolatedRelays = [startingRelay, ...excludedRelays];
        const relayPath = await Promise.race([
          findPath({
            fromId,
            relays: isolatedRelays,
            toId,
          }),
          throwAfter(1000),
        ]);

        const path = generateEthPath(fromSymbol, relayPath);
        const viewRelay = findOrThrow(allViewRelays, (relay) =>
          compareString(relay.id, startingRelay.anchorAddress)
        );

        return {
          startingRelayAnchor: startingRelay.anchorAddress,
          liqDepth: viewRelay.liqDepth,
          path,
          relays: relayPath,
        };
      }
    );

    const passedResults = results.filter((res) => res.liqDepth);

    if (passedResults.length === 0)
      throw new Error(`Failed finding a path between tokens`);

    const sortedReturns = passedResults.sort((a, b) =>
      new BigNumber(b.liqDepth).minus(a.liqDepth).toNumber()
    );
    const bestReturn = sortedReturns[0];
    return bestReturn.relays;
  } else {
    return findPath({ fromId, toId, relays });
  }
};

const generateEthPath = (from: string, relays: MinimalRelay[]) => {
  return relays.reduce<{
    lastSymbol: string;
    path: string[];
    sortedRelays: MinimalRelay[];
  }>(
    (acc, item) => {
      const destinationSymbol = item.reserves.find(
        (reserve) => reserve.symbol !== acc.lastSymbol
      )!;
      const anchorAddress = item.anchorAddress;
      const [fromReserve, toReserve] = sortAlongSide(
        item.reserves,
        (reserve) => reserve.symbol,
        [acc.lastSymbol]
      );
      return {
        path: [...acc.path, anchorAddress, destinationSymbol.contract],
        lastSymbol: destinationSymbol.symbol,
        sortedRelays: [
          ...acc.sortedRelays,
          { ...item, reserves: [fromReserve, toReserve] },
        ],
      };
    },
    {
      lastSymbol: from,
      path: [
        relays[0].reserves.find((reserve) => reserve.symbol === from)!.contract,
      ],
      sortedRelays: [],
    }
  );
};

const weiMinusSlippageTolerance = async (wei: string): Promise<string> => {
  const slippageTolerance = 0.005;
  if (typeof slippageTolerance !== 'number')
    throw new Error('Error finding slippage tolerance');
  const percent = new BigNumber(1).minus(slippageTolerance);
  const newWei = new BigNumber(wei).times(percent).toFixed(0);
  return newWei;
};

export enum ApproveTypes {
  limited = 'limited',
  unlimited = 'unlimited',
}

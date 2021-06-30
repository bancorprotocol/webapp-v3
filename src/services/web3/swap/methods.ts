import {
  buildNetworkContract,
  conversionPath,
  getRateByPath,
} from 'services/web3/contracts/network/wrapper';
import { web3 } from 'services/web3/contracts';
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
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { TokenListItem } from 'services/observables/tokens';
import {
  expandToken,
  mapIgnoreThrown,
  shrinkToken,
  updateArray,
} from 'utils/pureFunctions';
import { ethToken, getNetworkVariables, zeroAddress } from '../config';
import BigNumber from 'bignumber.js';
import { apiData$, apiTokens$ } from 'services/observables/pools';
import { currentNetwork$, networkVars$ } from 'services/observables/network';
import { partition, uniqWith, zip } from 'lodash';
import _ from 'lodash';
import wait from 'waait';
import { combineLatest, Subject } from 'rxjs';
import { fromWei, toHex, toWei } from 'web3-utils';
import { ContractSendMethod } from 'web3-eth-contract';
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

export const getRate = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
): Promise<string> => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const path = await conversionPath({
    from: fromToken.address,
    to: toToken.address,
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

let currentNetwork = EthNetworks.Ropsten;
let currentUser = '';

//Temporary
export const swap = async ({
  net,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  user,
  onUpdate,
  onPrompt,
}: {
  net: EthNetworks;
  fromToken: TokenListItem;
  toToken: TokenListItem;
  fromAmount: string;
  toAmount: string;
  user: string;
  onUpdate: Function;
  onPrompt: OnPrompt;
}): Promise<string> => {
  currentNetwork = net;
  currentUser = user;
  const fromIsEth = fromToken.address.toLowerCase() === ethToken.toLowerCase();
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const steps: any[] = [
    {
      name: 'Pathing',
      description: 'Finding path...',
    },
    {
      name: 'SetApprovalAmount',
      description: 'Setting approval amount...',
    },
    {
      name: 'ConvertProcessing',
      description: 'Processing conversion...',
    },
    {
      name: 'WaitingTxConf',
      description: 'Awaiting block confirmation...',
    },
    {
      name: 'Done',
      description: 'Done!',
    },
  ];

  onUpdate!(0, steps);

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

  onUpdate!(1, steps);
  await triggerApprovalIfRequired({
    owner: user,
    amount: fromWei,
    spender: networkContractAddress,
    tokenAddress: fromToken.address,
    onPrompt,
  });
  onUpdate!(2, steps);

  const networkContract = buildNetworkContract(networkContractAddress);

  const expectedReturnWei = expandToken(toAmount, toToken.decimals);

  const confirmedHash = await resolveTxOnConfirmation({
    tx: networkContract.methods.convertByPath(
      ethPath.path,
      fromWei,
      await weiMinusSlippageTolerance(expectedReturnWei),
      zeroAddress,
      zeroAddress,
      0
    ),
    onConfirmation: () => {}, //spamBalances([fromTokenContract, toTokenContract]),
    resolveImmediately: true,
    ...(fromIsEth && { value: fromWei }),
    onHash: () => onUpdate!(3, steps),
  });

  onUpdate!(4, steps);

  return confirmedHash;
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
type OnPrompt = (prompt: Prompt) => void;
type Node = string;

let newPools: NewPool[] = [];
let apiDataa: WelcomeData;
let poolLiqMiningAprs: PoolLiqMiningApr[] = [];
let allViewRelays: ViewRelay[];

let whiteListedPools: string[] = [];
const relaysList: readonly Relay[] = [];
const ORIGIN_ADDRESS = DataTypes.originAddress;

export const loadSwapInfo = async () => {
  apiDataa = await apiData$.pipe(take(1)).toPromise();

  newPools = await newPools$.pipe(take(1)).toPromise();
  console.log('newPools', newPools);

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

const getApprovedBalanceWei = async ({
  tokenAddress,
  owner,
  spender,
}: {
  tokenAddress: string;
  owner: string;
  spender: string;
}) => {
  const tokenContract = buildTokenContract(tokenAddress, web3);
  const approvedFromTokenBalance = await tokenContract.methods
    .allowance(owner, spender)
    .call();
  return approvedFromTokenBalance;
};

const isApprovalRequired = async ({
  owner,
  spender,
  amount,
  tokenAddress,
}: TokenWithdrawParam): Promise<{
  approvalIsRequired: boolean;
  currentApprovedBalance: string;
}> => {
  const currentApprovedBalance = await getApprovedBalanceWei({
    owner,
    spender,
    tokenAddress,
  });

  const sufficientBalanceAlreadyApproved = new BigNumber(
    currentApprovedBalance
  ).isGreaterThanOrEqualTo(amount);

  return {
    approvalIsRequired: !sufficientBalanceAlreadyApproved,
    currentApprovedBalance,
  };
};

const selectedPromptReceiver$ = new Subject<string>();

const awaitConfirmation = async (onPrompt: OnPrompt) => {
  const promptId = String(Date.now());

  enum ApproveTypes {
    confirm = 'confirm',
  }
  const questions = [ApproveTypes.confirm].map((label) => ({
    id: [promptId, label].join(':'),
    label,
  }));

  onPrompt({ questions });

  const receivedPromptId = await selectedPromptReceiver$
    .pipe(
      filter((id) => {
        const [pId] = id.split(':');
        return pId === promptId;
      }),
      take(1)
    )
    .toPromise();

  findOrThrow(
    questions,
    (question) => question.id === receivedPromptId,
    'failed finding selected question'
  );
};

const nullApprovals = [
  '0x8a9c67fee641579deba04928c4bc45f66e26343a',
  '0x309627af60f0926daa6041b8279484312f2bf060',
  '0x4fabb145d64652a948d72533023f6e7a623c7c53',
  '0xd46ba6d942050d489dbd938a2c909a5d5039a161',
  '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
  '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
  '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
  '0x1b22c32cd936cb97c28c5690a0695a82abf688e6',
  '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  '0x83cee9e086a77e492ee0bb93c2b0437ad6fdeccc',
  '0xaaaf91d9b90df800df4f55c205fd6989c977e73a',
  '0x340d2bde5eb28c1eed91b2f790723e3b160613b7',
  '0x27f610bf36eca0939093343ac28b1534a721dbb4',
  '0xf6b55acbbc49f4524aa48d19281a9a77c54de10f',
  '0x4ceda7906a5ed2179785cd3a40a69ee8bc99c466',
  '0x4aac461c86abfa71e9d00d9a2cde8d74e4e1aeea',
  '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
  '0x814e0908b12a99fecf5bc101bb5d0b8b5cdf7d26',
  '0xa15c7ebe1f07caf6bff097d8a589fb8ac49ae5b3',
  '0xd341d1680eeee3255b8c4c75bcce7eb57f144dae',
  '0xe3818504c1b32bf1557b16c238b2e01fd3149c17',
  '0x3d1ba9be9f66b8ee101911bc36d3fb562eac2244',
  '0x818fc6c2ec5986bc6e2cbf00939d90556ab12ce5',
  '0x780116d91e5592e58a3b3c76a351571b39abcec6',
  '0xb056c38f6b7dc4064367403e26424cd2c60655e1',
  '0x4162178b78d6985480a308b2190ee5517460406d',
  '0x0cf0ee63788a0849fe5297f3407f701e122cc023',
  '0xc20464e0c373486d2b3335576e83a218b1618a5e',
  '0xcbee6459728019cb1f2bb971dde2ee3271bc7617',
  '0x6888a16ea9792c15a4dcf2f6c623d055c8ede792',
  '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
  '0x28dee01d53fed0edf5f6e310bf8ef9311513ae40',
  '0x84f7c44b6fed1080f647e354d552595be2cc602f',
  '0xef2463099360a085f1f10b076ed72ef625497a06',
  '0xf04a8ac553fcedb5ba99a64799155826c136b0be',
  '0xf433089366899d83a9f26a773d59ec7ecf30355e',
  '0xa485bd50228440797abb4d4595161d7546811160',
  '0x9214ec02cb71cba0ada6896b8da260736a67ab10',
  '0x960b236a07cf122663c4303350609a66a7b288c0',
  '0x47ec6af8e27c98e41d1df7fb8219408541463022',
  '0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6',
  '0x6c37bf4f042712c978a73e3fd56d1f5738dd7c43',
  '0x0cb20b77adbe5cd58fcecc4f4069d04b327862e5',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xb8baa0e4287890a5f79863ab62b7f175cecbd433',
  '0x0000000000085d4780b73119b644ae5ecd22b376',
  '0x26e75307fc0c021472feb8f727839531f112f317',
  '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671',
  '0xc011a72400e58ecd99ee497cf89e3775d4bd732f',
  '0xb1a5b7e9a268742b9b5d2455ffcf43babc6929ba',
  '0x5e6f3bc1186132565946fea123181529e7aeafd8',
  '0xd758b77bcc792afd58857e1d5c610ae649fdee6b',
  '0x57ab1e02fee23774580c119740129eac7081e9d3',
  '0x0316eb71485b0ab14103307bf65a021042c6d380',
  '0x45804880de22913dafe09f4980848ece6ecbaf78',
  '0x67abf1c62d8acd07ada35908d38cd67be7dfeb36',
  '0xee4dc4c5ca843b83035d8e5159ac1bd1b4ebdff5',
  '0x94a2aaa374a8f2d52dad24330c8a0ec2934700ae',
  '0x7db5454f3500f28171d1f9c7a38527c9cf94e6b2',
  '0xb5f278ee11811efec0692ec61b1e9f9984f2de11',
  '0x0ecdd783dc7bf820614044b51862ed29714d2ba5',
  '0x37be876ef051eb8eddd0745107c5222d8ca8ec60',
  '0x83ee8ec605c0ae3d7f1c9e360ab45a6c1c033ab9',
  '0xe7845a9679dad2b1ccce49d5f0239d1c528f7a40',
  '0x623fa86c0e010fe4701cedf294c9cddb8f4f26e6',
  '0x8ae56a6850a7cbeac3c3ab2cb311e7620167eac8',
  '0x7ce0641d19095ed3226fc5222836901bce41585d',
  '0xcb0ad5f479812edd6e2ced1cfe621bf39d7e9158',
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
  '0x79a91ccaaa6069a571f0a3fa6ed257796ddd0eb4',
  '0x107721d9aa07d9de8f2cc9545e0c9346a9bb503b',
  '0x4a527d8fc13c5203ab24ba0944f4cb14658d1db6',
  '0xa1d65e8fb6e87b60feccbc582f7f97804b725521',
  '0x0ae055097c6d159879521c384f1d2123d1f195e6',
  '0x80fb784b7ed66730e8b1dbd9820afd29931aab03',
  '0x0b244e01b1b0c9a959b3b0bc19e3852395319876',
  '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44',
];

const approveTokenWithdrawals = async (
  approvals: {
    approvedAddress: string;
    amount: string;
    tokenAddress: string;
  }[]
) => {
  return Promise.all(
    approvals.map((approval) => {
      const tokenContract = buildTokenContract(approval.tokenAddress, web3);

      return resolveTxOnConfirmation({
        tx: tokenContract.methods.approve(
          approval.approvedAddress,
          approval.amount
        ),
      });
    })
  );
};
const approveTokenWithdrawal = async ({
  owner,
  spender,
  amount,
  tokenAddress,
  currentApprovedBalance,
}: TokenWithdrawParam) => {
  const isNullApprovalTokenContract = nullApprovals.some((contract) =>
    compareString(tokenAddress, contract)
  );

  const nullingTxRequired =
    isNullApprovalTokenContract &&
    fromWei(
      currentApprovedBalance ||
        (await getApprovedBalanceWei({
          owner,
          spender,
          tokenAddress,
        }))
    ) !== '0';

  if (nullingTxRequired) {
    await approveTokenWithdrawals([
      { approvedAddress: spender, amount: toWei('0'), tokenAddress },
    ]);
  }

  try {
    await approveTokenWithdrawals([
      { approvedAddress: spender, amount, tokenAddress },
    ]);
  } catch (e) {
    const isTxDenial = (e.message as string).toLowerCase().includes('denied');
    if (!isTxDenial) {
      nullApprovals.push(tokenAddress);
      console.error(
        'Approval had failed, forcing a zero approval in case required',
        e.message
      );
    }
    throw new Error(e.message);
  }
};

const unlimitedWei =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const triggerApprovalIfRequired = async (tokenWithdrawal: {
  owner: string;
  spender: string;
  tokenAddress: string;
  amount: string;
  onPrompt?: OnPrompt;
}) => {
  const fromIsEth = compareString(tokenWithdrawal.tokenAddress, ethToken);
  if (fromIsEth) {
    if (tokenWithdrawal.onPrompt) {
      return awaitConfirmation(tokenWithdrawal.onPrompt);
    }
  }
  const { approvalIsRequired, currentApprovedBalance } =
    await isApprovalRequired(tokenWithdrawal);

  if (!approvalIsRequired) {
    if (tokenWithdrawal.onPrompt) {
      return awaitConfirmation(tokenWithdrawal.onPrompt);
    }
    return;
  }

  const withCurrentApprovedBalance = {
    ...tokenWithdrawal,
    currentApprovedBalance,
  };
  if (tokenWithdrawal.onPrompt) {
    const { unlimitedApproval } = await promptUserForApprovalType(
      tokenWithdrawal.onPrompt
    );
    await approveTokenWithdrawal({
      ...withCurrentApprovedBalance,
      ...(unlimitedApproval && { amount: unlimitedWei }),
    });
    await awaitConfirmation(tokenWithdrawal.onPrompt);
  } else {
    return approveTokenWithdrawal(withCurrentApprovedBalance);
  }
};

const promptUserForApprovalType = async (
  onPrompt: OnPrompt
): Promise<{ unlimitedApproval: boolean }> => {
  const promptId = String(Date.now());

  enum ApproveTypes {
    limited = 'limited',
    unlimited = 'unlimited',
  }
  const questions = [ApproveTypes.unlimited, ApproveTypes.limited].map(
    (label) => ({ id: [promptId, label].join(':'), label })
  );

  onPrompt({ questions });

  const receivedPromptId = await selectedPromptReceiver$
    .pipe(
      filter((id) => {
        const [pId] = id.split(':');
        return pId === promptId;
      }),
      take(1)
    )
    .toPromise();

  const selectedQuestion = findOrThrow(
    questions,
    (question) => question.id === receivedPromptId,
    'failed finding selected question'
  );

  const unlimitedApproval = selectedQuestion.label === ApproveTypes.unlimited;
  return { unlimitedApproval };
};

const determineTxGas = async (tx: ContractSendMethod): Promise<number> => {
  const from = currentUser;
  if (!from) throw new Error('Cannot estimate gas without being authenticated');
  const buffer = 1.1;

  let adjustedGas: number;
  try {
    const withUser = await tx.estimateGas({ from });
    adjustedGas = withUser;
  } catch (e) {
    try {
      const withoutUser = await tx.estimateGas();
      adjustedGas = withoutUser;
    } catch (e) {
      throw new Error(`Failed estimating gas for tx ${e}`);
    }
  }
  const bufferedResult = adjustedGas * buffer;
  return new BigNumber(bufferedResult.toFixed(0)).toNumber();
};

const resolveTxOnConfirmation = async ({
  tx,
  gas,
  value,
  resolveImmediately = false,
  onHash,
  onConfirmation,
}: {
  tx: ContractSendMethod;
  value?: string;
  gas?: number;
  resolveImmediately?: boolean;
  onHash?: (hash: string) => void;
  onConfirmation?: (hash: string) => void;
}): Promise<string> => {
  let adjustedGas: number | boolean = false;
  if (gas) {
    adjustedGas = gas;
  } else {
    try {
      adjustedGas = await determineTxGas(tx);
    } catch (e) {}
  }

  return new Promise((resolve, reject) => {
    let txHash: string;
    tx.send({
      from: currentUser,
      ...(adjustedGas && { gas: adjustedGas as number }),
      ...(value && { value: toHex(value) }),
    })
      .on('transactionHash', (hash: string) => {
        txHash = hash;
        if (onHash) onHash(hash);
        if (resolveImmediately) {
          resolve(txHash);
        }
      })
      .on('confirmation', (confirmationNumber: number) => {
        if (confirmationNumber === 1) {
          if (onConfirmation) onConfirmation(txHash);
          resolve(txHash);
        }
      })
      .on('error', (error: any) => reject(error));
  });
};

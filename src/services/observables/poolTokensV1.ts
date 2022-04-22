import { bancorConverterRegistry$ } from 'services/observables/contracts';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { ConverterRegistry__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import { shareReplay, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { ConverterAndAnchor } from 'services/web3/types';
import { user$ } from 'services/observables/user';
import { multicall } from 'services/web3/multicall/multicall';
import { utils } from 'ethers';
import { zip } from 'lodash';
import { poolsNew$, PoolToken } from 'services/observables/pools';
import { findPoolByConverter } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { buildTokenPoolCall } from 'services/web3/swap/market';
import { ropstenImage } from 'services/web3/config';
import BigNumber from 'bignumber.js';
import { apiPools$ } from 'services/observables/apiData';
import {
  buildTokenBalanceCall,
  buildTokenTotalSupplyCall,
} from 'services/web3/token/token';

const trueAnchors$ = bancorConverterRegistry$.pipe(
  switchMapIgnoreThrow(async (converterRegistry) => {
    const contract = ConverterRegistry__factory.connect(
      converterRegistry,
      web3.provider
    );
    return await contract.getAnchors();
  }),
  shareReplay(1)
);

const anchorAndConverters$ = combineLatest([
  trueAnchors$,
  bancorConverterRegistry$,
]).pipe(
  switchMapIgnoreThrow(async ([anchorAddresses, converterRegistryAddress]) => {
    const contract = ConverterRegistry__factory.connect(
      converterRegistryAddress,
      web3.provider
    );

    const converters = await contract.getConvertersByAnchors(anchorAddresses);
    return zipAnchorAndConverters(anchorAddresses, converters);
  }),
  startWith([] as ConverterAndAnchor[]),
  shareReplay(1)
);

export const partialPoolTokens$ = combineLatest([
  anchorAndConverters$,
  user$,
]).pipe(
  switchMapIgnoreThrow(async ([anchorAndConverters, user]) => {
    if (!user) return [];

    const calls = anchorAndConverters.map((x) =>
      buildTokenBalanceCall(x.anchorAddress, user)
    );

    const res = await multicall(calls);
    if (res) {
      const partialPTokens = res
        .map((x, index) => {
          const anchorConverter = anchorAndConverters[index];
          return {
            balance: x.length > 0 ? (x[0] as BigNumber).toString() : '0',
            anchor: anchorConverter.anchorAddress,
            converter: anchorConverter.converterAddress,
          };
        })
        .filter((x) => x.balance !== '0');

      const calls = partialPTokens.map((x) =>
        buildTokenTotalSupplyCall(x.anchor)
      );
      const total = await multicall(calls);
      if (total) {
        return partialPTokens.map((token, index) => ({
          totalSupply: total[index].toString(),
          ...token,
        }));
      }
    }

    return [];
  })
);

const zipAnchorAndConverters = (
  anchorAddresses: string[],
  converterAddresses: string[]
): ConverterAndAnchor[] => {
  if (anchorAddresses.length !== converterAddresses.length)
    throw new Error(
      'was expecting as many anchor addresses as converter addresses'
    );

  const zipped = zip(anchorAddresses, converterAddresses) as [string, string][];
  return zipped.map(([anchorAddress, converterAddress]) => ({
    anchorAddress: utils.getAddress(anchorAddress!),
    converterAddress: utils.getAddress(converterAddress!),
  }));
};

export const poolTokens$ = combineLatest([
  poolsNew$,
  partialPoolTokens$,
  apiPools$,
]).pipe(
  switchMapIgnoreThrow(async ([pools, partialPoolTokens, apiPools]) => {
    const res = await Promise.all<PoolToken | null>(
      partialPoolTokens.map(async (poolToken) => {
        const pool = findPoolByConverter(poolToken.converter, pools, apiPools);
        if (!pool) {
          return null;
        }
        const tkn = pool.reserves[0];
        const bnt = pool.reserves[1];

        const amount = shrinkToken(poolToken.balance, pool.decimals);
        const percent = new BigNumber(amount).div(
          shrinkToken(poolToken.totalSupply, pool.decimals)
        );

        const balances = await multicall(
          pool.reserves.map((x) =>
            buildTokenPoolCall(pool.converter_dlt_id, x.address)
          )
        );
        if (!balances) {
          return null;
        }
        const tknBalanceWei = new BigNumber(balances[0].toString());
        const bntBalanceWei = new BigNumber(balances[1].toString());

        const tknAmount = percent.times(
          shrinkToken(tknBalanceWei, pool.decimals)
        );
        const bntAmount = percent.times(
          shrinkToken(bntBalanceWei, pool.decimals)
        );

        const value = tknAmount
          // @ts-ignore
          .times(Number(tkn.usdPrice || 0))
          // @ts-ignore
          .plus(bntAmount.times(Number(bnt.usdPrice || 0)))
          .toString();

        return {
          bnt: {
            token: {
              symbol: 'BNT',
              logoURI: ropstenImage,
              usdPrice: '0',
              decimals: 0,
              ...bnt,
            },
            amount: bntAmount.toString(),
          },
          tkn: {
            token: {
              symbol: pool.name.replace('/BNT', ''),
              logoURI: ropstenImage,
              usdPrice: '0',
              decimals: 0,
              ...tkn,
            },
            amount: tknAmount.toString(),
          },
          amount,
          value,
          poolDecimals: pool.decimals,
          converter: poolToken.converter,
          poolName: pool.name,
          version: pool.version,
        };
      })
    );
    return res.filter((x) => !!x);
  })
);

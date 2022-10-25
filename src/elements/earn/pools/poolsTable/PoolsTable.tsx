import { Token } from 'services/observables/tokens';
import { useCallback, useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'store';
import { SearchInput } from 'components/searchInput/SearchInput';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { PoolsTableFilter } from './PoolsTableFilter';
import { PoolV3 } from 'services/observables/pools';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Statistics } from 'elements/earn/pools/Statistics';
import { TopPools } from 'elements/earn/pools/TopPools';
import { sortNumbersByKey } from 'utils/pureFunctions';
import { Navigate } from 'components/navigate/Navigate';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { Image } from 'components/image/Image';
import { DepositV3Modal } from './v3/DepositV3Modal';
import { SnapshotLink } from 'elements/earn/pools/SnapshotLink';
import { config } from 'config';
import { BaseCurrency } from 'store/user/user';

export const PoolsTable = ({
  rewards,
  setRewards,
  lowVolume,
  setLowVolume,
  lowLiquidity,
  setLowLiquidity,
  lowEarnRate,
  setLowEarnRate,
}: {
  rewards: boolean;
  setRewards: Function;
  lowVolume: boolean;
  setLowVolume: Function;
  lowLiquidity: boolean;
  setLowLiquidity: Function;
  lowEarnRate: boolean;
  setLowEarnRate: Function;
}) => {
  const pools = useAppSelector((state) => state.pool.v3Pools);
  const baseCurrency = useAppSelector((state) => state.user.baseCurrency);
  const isUSD = baseCurrency === BaseCurrency.USD;

  const [search, setSearch] = useState('');

  const data = useMemo<PoolV3[]>(() => {
    return pools.filter(
      (p) =>
        p.name &&
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (lowVolume || Number(p.volume24h.usd) > 5000) &&
        (lowLiquidity || Number(p.tradingLiquidityTKN.usd) > 50000) &&
        (lowEarnRate || p.apr7d.total > 0.15) &&
        (!rewards || p.latestProgram?.isActive)
    );
  }, [pools, search, lowVolume, lowLiquidity, lowEarnRate, rewards]);

  const toolTip = useCallback(
    (row: PoolV3) => (
      <div className="w-[150px] text-black-medium dark:text-white-medium">
        <div className="flex items-center justify-between">
          Liquidity
          <div>
            {toBigNumber(row.stakedBalance.usd).isZero()
              ? 'New'
              : prettifyNumber(
                  isUSD ? row.stakedBalance.usd : row.stakedBalance.eth,
                  isUSD
                ).slice(0, 6) + (isUSD ? '' : ' ETH')}
          </div>
        </div>
        <div className="flex items-center justify-between">
          Volume 7d
          <div>
            {toBigNumber(row.volume7d.usd).isZero()
              ? 'New'
              : prettifyNumber(
                  isUSD ? row.volume7d.usd : row.volume7d.eth,
                  isUSD
                ).slice(0, 6) + (isUSD ? '' : ' ETH')}
          </div>
        </div>
        <div className="flex items-center justify-between">
          Fees 7d
          <div>
            {toBigNumber(row.fees7d.usd).isZero()
              ? 'New'
              : prettifyNumber(
                  isUSD ? row.fees7d.usd : row.fees7d.eth,
                  isUSD
                ).slice(0, 4) + (isUSD ? '' : ' ETH')}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            LP Fees 7d
            <SnapshotLink />
          </div>
          <div>
            {toBigNumber(row.fees7d.usd).minus(row.networkFees7d.usd).isZero()
              ? 'New'
              : prettifyNumber(
                  isUSD
                    ? toBigNumber(row.fees7d.usd).minus(row.networkFees7d.usd)
                    : toBigNumber(row.fees7d.eth).minus(row.networkFees7d.eth),
                  isUSD
                ).slice(0, 4) + (isUSD ? '' : ' ETH')}
          </div>
        </div>
      </div>
    ),
    [isUSD]
  );

  const columns = useMemo<TableColumn<PoolV3>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        Cell: (cellData) => (
          <PopoverV3
            children={toolTip(cellData.row.original)}
            buttonElement={() => (
              <div className="flex items-center">
                <Image
                  src={cellData.row.original.reserveToken.logoURI}
                  alt="Pool Logo"
                  className="w-40 h-40 !rounded-full mr-10"
                />
                <span className="text-16">{cellData.value}</span>
              </div>
            )}
          />
        ),
        minWidth: 185,
        sortDescFirst: true,
      },
      {
        id: 'apr',
        Header: 'APR (7d)',
        accessor: 'apr7d',
        Cell: (cellData) => (
          <div className="flex items-center gap-8 text-16 text-primary">
            {toBigNumber(cellData.value.total).isZero() &&
            cellData.row.original.tradingEnabled === false
              ? 'New'
              : `${cellData.value.total.toFixed(2)}%`}

            {(cellData.row.original.latestProgram?.isActive ||
              cellData.row.original.autoCompoundingRewardsActive) && (
              <>
                <PopoverV3
                  buttonElement={() => <IconGift className="w-16 h-16" />}
                >
                  <div>
                    Rewards enabled on this token.{' '}
                    <Navigate
                      to={config.externalUrls.rewardsProgramsArticle}
                      className="hover:underline text-primary"
                    >
                      Read about the rewards here
                    </Navigate>
                  </div>
                </PopoverV3>
              </>
            )}
          </div>
        ),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['apr7d', 'total']),
        tooltip: (
          <span>
            Estimated APR based on the last 7d LP fees <SnapshotLink />
          </span>
        ),
        minWidth: 100,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'poolDltId',
        Cell: (cellData) => (
          <DepositV3Modal
            pool={cellData.row.original}
            renderButton={(onClick) => (
              <Button
                onClick={() => onClick('Main Table')}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.ExtraSmall}
              >
                Deposit
              </Button>
            )}
          />
        ),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    [toolTip]
  );

  const defaultSort: SortingRule<Token> = {
    id: 'apr',
    desc: true,
  };

  return (
    <section className="lg:grid lg:grid-cols-12 lg:gap-40">
      <div className={'col-span-8'}>
        <div className="pt-20 content-block">
          <div className="flex justify-between items-center mb-20 mx-[20px]">
            <div className="flex items-center gap-x-10">
              <div className="mr-16">
                <SearchInput
                  value={search}
                  setValue={setSearch}
                  className="w-[170px] md:w-[300px] rounded-20 h-[35px]"
                />
              </div>
            </div>
            <PoolsTableFilter
              rewards={rewards}
              setRewards={setRewards}
              lowVolume={lowVolume}
              setLowVolume={setLowVolume}
              lowLiquidity={lowLiquidity}
              setLowLiquidity={setLowLiquidity}
              lowEarnRate={lowEarnRate}
              setLowEarnRate={setLowEarnRate}
            />
          </div>
          <DataTable<PoolV3>
            data={data}
            columns={columns}
            defaultSort={defaultSort}
            isLoading={!pools.length}
            search={search}
          />
        </div>
      </div>
      <div className="hidden col-span-4 space-y-40 lg:block">
        <Statistics />
        <TopPools />
      </div>
    </section>
  );
};

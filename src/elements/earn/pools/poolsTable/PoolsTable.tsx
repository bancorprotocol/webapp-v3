import { useCallback, useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { SearchInput } from 'components/searchInput/SearchInput';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { PoolsTableSort } from './PoolsTableFilter';
// import { DepositV3Modal } from 'elements/earn/pools/poolsTable/v3/DepositV3Modal';
import { DepositDisabledModal } from 'elements/earn/pools/poolsTable/v3/DepositDisabledModal';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Statistics } from 'elements/earn/pools/Statistics';
import { TopPools } from 'elements/earn/pools/TopPools';
import { sortNumbersByKey } from 'utils/pureFunctions';
import { Navigate } from 'components/navigate/Navigate';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { Image } from 'components/image/Image';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { PoolNew, usePoolPick } from 'queries/chain/usePoolPick';

const poolKeys = [
  'poolDltId',
  'symbol',
  'fees',
  'tradingLiquidity',
  'apr',
  'volume',
  'tradingEnabled',
  'stakedBalance',
  'latestProgram',
] as const;

type Pool = Pick<PoolNew, typeof poolKeys[number]>;

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
  const { data: poolIds, isLoading } = useChainPoolIds();

  const { getMany } = usePoolPick([...poolKeys]);

  const pools: Pool[] = useMemo(() => {
    return getMany(poolIds || []);
  }, [getMany, poolIds]);

  const [search, setSearch] = useState('');

  const data = useMemo(() => {
    return pools
      ? pools.filter(
          (p) =>
            p.symbol.toLowerCase().includes(search.toLowerCase()) &&
            (lowVolume || Number(p.volume?.volume24h?.usd) > 5000) &&
            (lowLiquidity || Number(p.tradingLiquidity.TKN.usd) > 50000) &&
            (lowEarnRate || (p.apr?.apr7d?.total ?? 0) > 0.15)
        )
      : [];
  }, [pools, search, lowVolume, lowLiquidity, lowEarnRate]);

  const toolTip = useCallback(
    (row: Pool) => (
      <div className="w-[150px] text-black-medium dark:text-white-medium">
        {row.stakedBalance.usd && (
          <div className="flex items-center justify-between">
            Liquidity
            <div>
              {toBigNumber(row.stakedBalance.usd).isZero()
                ? 'New'
                : prettifyNumber(row.stakedBalance.usd, true)}
            </div>
          </div>
        )}
        {row.volume?.volume7d?.usd && (
          <div className="flex items-center justify-between">
            Volume 7d
            <div>
              {toBigNumber(row.volume.volume7d.usd).isZero()
                ? 'New'
                : prettifyNumber(row.volume.volume7d.usd, true)}
            </div>
          </div>
        )}
        {row.fees?.fees7d.usd && (
          <div className="flex items-center justify-between">
            Fees 7d
            <div>
              {toBigNumber(row.fees.fees7d.usd).isZero()
                ? 'New'
                : prettifyNumber(row.fees.fees7d.usd, true)}
            </div>
          </div>
        )}
      </div>
    ),
    []
  );

  const columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'symbol',
        Cell: (cellData) => (
          <PopoverV3
            children={toolTip(cellData.row.original)}
            buttonElement={() => (
              <div className="flex items-center">
                <Image
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
        Header: 'Earn',
        accessor: 'apr',
        Cell: (cellData) => (
          <div className="flex items-center gap-8 text-16 text-primary">
            {cellData.value
              ? toBigNumber(cellData.value.apr7d.total).isZero() &&
                !cellData.row.original.tradingEnabled
                ? 'New'
                : `${cellData.value.apr7d.total.toFixed(2)}%`
              : 'N/A'}
            {}

            {cellData.row.original.latestProgram?.isActive && (
              <>
                <PopoverV3
                  buttonElement={() => <IconGift className="w-16 h-16" />}
                >
                  <div>
                    Rewards enabled on this token.{' '}
                    <Navigate
                      to="https://support.bancor.network/hc/en-us/articles/5415540047506-Auto-Compounding-Rewards-Standard-Rewards-programs"
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
          sortNumbersByKey(a.original, b.original, ['apr', 'apr7d', 'total']),
        tooltip:
          'Estimated APR based on the last 7d trading fees, auto compounding and standard rewards',
        minWidth: 100,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'poolDltId',
        Cell: (_) => (
          <DepositDisabledModal
            renderButton={(onClick) => (
              <Button
                onClick={onClick}
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

  const defaultSort: SortingRule<Pool> = {
    id: 'apr.apr7d.total',
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
            <PoolsTableSort
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
          <DataTable<Pool>
            data={data}
            columns={columns}
            defaultSort={defaultSort}
            isLoading={isLoading}
            search={search}
          />
        </div>
      </div>
      <div className="hidden col-span-4 space-y-40 lg:block">
        <section className="content-block p-20">
          <Statistics />
        </section>
        <TopPools />
      </div>
    </section>
  );
};

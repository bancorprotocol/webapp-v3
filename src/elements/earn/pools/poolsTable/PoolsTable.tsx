import { Token } from 'services/observables/tokens';
import { useCallback, useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'store';
import { SearchInput } from 'components/searchInput/SearchInput';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { PoolsTableSort } from './PoolsTableSort';
import { PoolV3 } from 'services/observables/pools';
import { Image } from 'components/image/Image';
import { DepositV3Modal } from 'elements/earn/pools/poolsTable/v3/DepositV3Modal';
import { prettifyNumber } from 'utils/helperFunctions';
import { Tooltip } from 'components/tooltip/Tooltip';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Statistics } from 'elements/earn/pools/Statistics';
import { TopPools } from 'elements/earn/pools/TopPools';
import { sortNumbersByKey } from 'utils/pureFunctions';
import { Navigate } from 'components/navigate/Navigate';

export const PoolsTable = () => {
  const pools = useAppSelector((state) => state.pool.v3Pools);

  const [rewards, setRewards] = useState(false);
  const [search, setSearch] = useState('');
  const [lowVolume, setLowVolume] = useState(true);
  const [lowLiquidity, setLowLiquidity] = useState(true);
  const [lowEarnRate, setLowEarnRate] = useState(true);

  const data = useMemo<PoolV3[]>(() => {
    return pools.filter(
      (p) =>
        p.name &&
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (lowVolume || Number(p.volume24h.usd) > 5000) &&
        (lowLiquidity || Number(p.tradingLiquidityTKN.usd) > 50000) &&
        (lowEarnRate || p.apr.total > 0.15)
    );
  }, [pools, search, lowVolume, lowLiquidity, lowEarnRate]);

  const toolTip = useCallback(
    (row: PoolV3) => (
      <div className="w-[150px] text-black-medium dark:text-white-medium">
        <div className="flex items-center justify-between">
          Liquidity
          <div>{prettifyNumber(row.stakedBalance.usd, true)}</div>
        </div>
        <div className="flex items-center justify-between">
          Volume 24h
          <div>{prettifyNumber(row.volume24h.usd, true)}</div>
        </div>
        <div className="flex items-center justify-between">
          Fees 24h
          <div>{prettifyNumber(row.fees24h.usd, true)}</div>
        </div>
      </div>
    ),
    []
  );

  const columns = useMemo<TableColumn<PoolV3>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        Cell: (cellData) => (
          <Tooltip
            content={toolTip(cellData.row.original)}
            placement={'bottom'}
            button={
              <div className="flex items-center">
                <Image
                  src={cellData.row.original.reserveToken.logoURI}
                  alt="Pool Logo"
                  className="w-40 h-40 rounded-full mr-10"
                />
                <span>{cellData.value}</span>
              </div>
            }
          />
        ),
        minWidth: 100,
        sortDescFirst: true,
      },
      {
        id: 'apr',
        Header: 'Earn',
        accessor: 'apr',
        Cell: (cellData) => (
          <div className="flex items-center gap-8 text-20 text-primary">
            {cellData.value.total.toFixed(2)}%
            {cellData.row.original.latestProgram?.isActive && (
              <Tooltip
                content={
                  <span className="text-16">
                    Rewards enabled on this token.{' '}
                    <Navigate
                      to="https://support.bancor.network/hc/en-us/articles/5415540047506-Auto-Compounding-Rewards-Standard-Rewards-programs"
                      className="hover:underline text-primary"
                    >
                      Read about the rewards here
                    </Navigate>
                  </span>
                }
                button={<IconGift className="w-14 h-14" />}
              />
            )}
          </div>
        ),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['apr', 'total']),
        tooltip: 'Rewards enabled on this token. Read about the rewards here',
        minWidth: 130,
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
                onClick={onClick}
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.EXTRASMALL}
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

  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section className="lg:grid lg:grid-cols-12 lg:gap-40">
      <div className={'col-span-8'}>
        <div className="content-block pt-20">
          <div className="flex justify-between items-center mb-20 mx-[20px]">
            <div className="flex items-center gap-x-10">
              <div className="mr-16">
                <SearchInput
                  value={search}
                  setValue={setSearch}
                  className="max-w-[300px] rounded-20 h-[35px]"
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
          <DataTable<PoolV3>
            data={data}
            columns={columns}
            defaultSort={defaultSort}
            isLoading={!pools.length}
            search={search}
          />
        </div>
      </div>
      <div className="hidden lg:block col-span-4 space-y-40">
        <Statistics />
        <TopPools />
      </div>
    </section>
  );
};

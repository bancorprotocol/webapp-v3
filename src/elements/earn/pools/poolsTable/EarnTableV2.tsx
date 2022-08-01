import { Token } from 'services/observables/tokens';
//import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'store';
import { PoolsTableCellName } from 'elements/earn/pools/poolsTable/PoolsTableCellName';
import { PoolsTableCellApr } from 'elements/earn/pools/poolsTable/PoolsTableCellApr';
import { SearchInput } from 'components/searchInput/SearchInput';
import { PoolsTableCellActions } from './PoolsTableCellActions';
import { PoolsTableFilter } from './PoolsTableFilter';
import { Pool } from 'services/observables/pools';
import { prettifyNumber } from 'utils/helperFunctions';
import { sortNumbersByKey } from 'utils/pureFunctions';
import { getV2PoolsWithoutV3 } from 'store/bancor/pool';
import { SnapshotLink } from 'elements/earn/pools/SnapshotLink';

export const EarnTableV2 = ({
  lowVolume,
  setLowVolume,
  lowLiquidity,
  setLowLiquidity,
  lowEarnRate,
  setLowEarnRate,
}: {
  lowVolume: boolean;
  setLowVolume: Function;
  lowLiquidity: boolean;
  setLowLiquidity: Function;
  lowEarnRate: boolean;
  setLowEarnRate: Function;
}) => {
  const pools = useAppSelector(getV2PoolsWithoutV3);

  const [search, setSearch] = useState('');

  const data = useMemo<Pool[]>(() => {
    return pools
      .filter((p) => p.version >= 28)
      .filter(
        (p) =>
          p.name &&
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (lowVolume || p.volume_24h > 5000) &&
          (lowLiquidity || p.liquidity > 50000) &&
          (lowEarnRate || p.apr_7d > 0.15)
      );
  }, [pools, search, lowVolume, lowLiquidity, lowEarnRate]);

  const columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        Cell: (cellData) => PoolsTableCellName(cellData.row.original),
        minWidth: 200,
        sortDescFirst: true,
      },
      // {
      //   id: 'isProtected',
      //   Header: 'Protected',
      //   accessor: 'isProtected',
      //   headerClassName: 'justify-center',
      //   Cell: (cellData) =>
      //     cellData.value ? (
      //       <div className="flex justify-center">
      //         <IconProtected className="h-20 w-18 text-primary" />
      //       </div>
      //     ) : (
      //       <div />
      //     ),
      //   sortType: (a, b) =>
      //     sortNumbersByKey(a.original, b.original, ['isProtected']),
      //   minWidth: 140,
      //   width: 140,
      //   sortDescFirst: true,
      // },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => <>{prettifyNumber(cellData.value, true)}</>,
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['liquidity']),
        tooltip: 'The value of tokens staked in the pool.',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr_7d',
        Cell: (cellData) => PoolsTableCellApr(cellData.row.original),
        minWidth: 180,
        disableSortBy: true,
        tooltip: (
          <span>
            Estimated APR based on the last 24h LP fees
            <SnapshotLink />
          </span>
        ),
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'pool_dlt_id',
        Cell: (cellData) => PoolsTableCellActions(cellData.value),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );

  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section>
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
          isLoading={!pools.length}
          search={search}
          stickyColumn
        />
      </div>
    </section>
  );
};

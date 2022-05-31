import { Token } from 'services/observables/tokens';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'store';
import { PoolsTableCellName } from 'elements/earn/pools/poolsTable/PoolsTableCellName';
import { PoolsTableCellApr } from 'elements/earn/pools/poolsTable/PoolsTableCellApr';
import { SearchInput } from 'components/searchInput/SearchInput';
import { PoolsTableCellActions } from './PoolsTableCellActions';
import { PoolsTableSort } from './PoolsTableFilter';
import { Pool } from 'services/observables/pools';
import { prettifyNumber } from 'utils/helperFunctions';
import { sortNumbersByKey } from 'utils/pureFunctions';
import { getV2PoolsWithoutV3 } from 'store/bancor/pool';

export const EarnTableV2 = () => {
  const pools = useAppSelector(getV2PoolsWithoutV3);

  const [lowVolume, setLowVolume] = useState(false);
  const [lowLiquidity, setLowLiquidity] = useState(false);
  const [lowEarnRate, setLowEarnRate] = useState(false);
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
          (lowEarnRate || p.apr > 0.15)
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
      {
        id: 'isProtected',
        Header: 'Protected',
        accessor: 'isProtected',
        headerClassName: 'justify-center',
        Cell: (cellData) =>
          cellData.value ? (
            <div className="flex justify-center">
              <IconProtected className="w-18 h-20 text-primary" />
            </div>
          ) : (
            <div />
          ),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['isProtected']),
        minWidth: 140,
        width: 140,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['liquidity']),
        tooltip: 'The value of tokens staked in the pool.',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr',
        Cell: (cellData) => PoolsTableCellApr(cellData.row.original),
        minWidth: 180,
        disableSortBy: true,
        tooltip:
          'Estimated APR based on the maximum (2x multiplier) weekly BNT Liquidity Mining rewards. Counter indicates time until 12-week rewards cycle concludes.',
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
      <div className="content-block pt-20">
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

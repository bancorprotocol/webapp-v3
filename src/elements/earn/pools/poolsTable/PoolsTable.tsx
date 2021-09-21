import { Pool, Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { useMemo } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'redux/index';
import { PoolsTableCellName } from 'elements/earn/pools/poolsTable/PoolsTableCellName';
import { PoolsTableCellRewards } from 'elements/earn/pools/poolsTable/PoolsTableCellRewards';
import { PoolsTableCellActions } from 'elements/earn/pools/poolsTable/PoolsTableCellActions';

interface Props {
  search: string;
  setSearch: Function;
}

export const PoolsTable = ({ search, setSearch }: Props) => {
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);

  const data = useMemo<Pool[]>(() => {
    return pools.filter(
      (p) => p.name && p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [pools, search]);

  const columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: () => (
          <span className="align-middle inline-flex items-center">
            <IconProtected className="w-18 mr-20" /> <span>Name</span>
          </span>
        ),
        accessor: 'name',
        Cell: (cellData) => PoolsTableCellName(cellData.row.original),
        minWidth: 225,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        tooltip: 'The value of tokens staked in the pool.',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'v24h',
        Header: '24h Volume',
        accessor: 'volume_24h',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        minWidth: 120,
        sortDescFirst: true,
      },
      {
        id: 'f24h',
        Header: '24h Fees',
        accessor: 'fees_24h',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        minWidth: 90,
        sortDescFirst: true,
      },
      {
        id: 'rewards',
        Header: 'Rewards',
        accessor: 'reward',
        Cell: (cellData) => PoolsTableCellRewards(cellData.row.original),
        minWidth: 250,
        disableSortBy: true,
        tooltip:
          'Estimated APR based on the maximum (2x multiplier) weekly BNT Liquidity Mining rewards. Counter indicates time until 12-week rewards cycle concludes.',
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr',
        Cell: (cellData) => `${cellData.value.toFixed(2)}%`,
        minWidth: 80,
        sortDescFirst: true,
        tooltip: '24h fees annualized divided by liquidity in the pool. ',
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'isProtected',
        Cell: (cellData) => PoolsTableCellActions(cellData.row.original),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );

  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>Pools</h2>
        <div className="relative">
          <IconSearch className="absolute w-16 ml-14 text-grey-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="block w-full max-w-[160px] border border-grey-2 rounded-10 pl-[38px] h-[35px] dark:bg-blue-4 dark:border-grey-4 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <DataTable<Pool>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!pools.length}
        stickyColumn
      />
    </section>
  );
};

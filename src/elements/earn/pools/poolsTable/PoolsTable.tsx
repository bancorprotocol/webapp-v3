import { Pool, Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo } from 'react';
import { SortingRule, Row } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'redux/index';
import { PoolsTableCellName } from 'elements/earn/pools/poolsTable/PoolsTableCellName';
import { PoolsTableCellRewards } from 'elements/earn/pools/poolsTable/PoolsTableCellRewards';
import { PoolsTableCellActions } from 'elements/earn/pools/poolsTable/PoolsTableCellActions';
import { ModalCreatePool } from 'elements/modalCreatePool/ModalCreatePool';
import { PoolsTableCellApr } from 'elements/earn/pools/poolsTable/PoolsTableCellApr';
import { SearchInput } from 'components/searchInput/SearchInput';

interface Props {
  search: string;
  setSearch: (value: string) => void;
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
        minWidth: 100,
        sortDescFirst: true,
        sortType: (a: Row<Pool>, b: Row<Pool>, id: string) => {
          if (!!a.values[id] && !b.values[id]) return 1;
          if (!a.values[id] && !!b.values[id]) return -1;
          return a.values['liquidity'] > b.values['liquidity'] ? 1 : -1;
        },
        tooltip:
          'Active indicates a current liquidity mining program on the pool.',
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr',
        headerClassName: 'justify-center',
        Cell: (cellData) => PoolsTableCellApr(cellData.row.original),
        minWidth: 250,
        disableSortBy: true,
        tooltip:
          'Estimated based on the maximum BNT Liquidity Mining rewards multiplier (2x) and annualized trading fees. ',
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
        <div className="flex align-center">
          <div className="mr-16">
            <SearchInput
              value={search}
              setValue={setSearch}
              className="max-w-[160px] rounded-10 h-[35px]"
            />
          </div>
          <div className="hidden md:block">
            <ModalCreatePool />
          </div>
        </div>
      </div>

      <DataTable<Pool>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!pools.length}
        stickyColumn
        search={search}
      />
    </section>
  );
};

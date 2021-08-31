import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { NavLink } from 'react-router-dom';
import { APIPool } from 'services/api/bancor';

interface Props {
  pools: APIPool[];
}

export const PoolsTable = ({ pools }: Props) => {
  const [searchInput, setSearchInput] = useState('');
  const data = useMemo<APIPool[]>(() => {
    return pools.filter((p) =>
      p.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [pools, searchInput]);

  const CellName = (pool: APIPool) => {
    return (
      <div className={'flex items-center'}>
        <div className="w-18">
          {pool.isWhitelisted && (
            <IconProtected className={`w-18 h-20 text-primary`} />
          )}
        </div>
        <h3 className="text-14">{pool.name}</h3>
      </div>
    );
  };

  const columns = useMemo<TableColumn<APIPool>[]>(
    () => [
      {
        id: 'name',
        Header: () => (
          <span className="align-middle inline-flex items-center">
            <IconProtected className="w-18 mr-20" /> <span>Name</span>
          </span>
        ),
        accessor: 'name',
        Cell: (cellData) => CellName(cellData.row.original),
        minWidth: 180,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => {
          return (
            <div>
              <div>{prettifyNumber(cellData.value.usd ?? 0, true)}</div>
            </div>
          );
        },
        tooltip: 'The value of tokens staked in the pool',
        minWidth: 150,
        sortDescFirst: true,
      },
      {
        id: 'fee',
        Header: 'Fee',
        accessor: 'fee',
        Cell: (cellData) => cellData.value,
        minWidth: 110,
        sortDescFirst: true,
      },
      {
        id: 'v24h',
        Header: '24h Volume',
        accessor: 'volume_24h',
        Cell: (cellData) => prettifyNumber(cellData.value.usd ?? 0, true),
        minWidth: 120,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: () => (
          <NavLink
            to="/"
            className="btn-primary btn-sm rounded-[12px] w-[94px] h-[29px]"
          >
            Trade
          </NavLink>
        ),
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="block w-full max-w-[160px] border border-grey-2 rounded-10 pl-[38px] h-[35px] dark:bg-blue-4 dark:border-grey-4 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <DataTable<APIPool>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!pools.length}
        stickyColumn
      />
    </section>
  );
};

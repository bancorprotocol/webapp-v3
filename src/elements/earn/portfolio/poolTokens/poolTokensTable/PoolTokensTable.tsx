import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { PoolToken } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { PoolTokensCellActions } from './PoolTokensCellActions';
import { PoolTokensCellName } from './PoolTokensCellName';
import { PoolTokensCellReserve } from './PoolTokensCellReserve';

export const PoolTokensTable = () => {
  const [search, setSearch] = useState('');
  const poolTokens = useAppSelector<PoolToken[]>(
    (state) => state.liquidity.poolTokens
  );

  const data = useMemo<PoolToken[]>(() => {
    return poolTokens.filter((p) =>
      p.bnt.token.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [poolTokens, search]);

  const columns = useMemo<TableColumn<PoolToken>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'bnt',
        Cell: (cellData) => PoolTokensCellName(cellData.row.original),
        minWidth: 130,
      },
      {
        id: 'amount',
        Header: 'Amount',
        accessor: 'amount',
        Cell: (cellData) => prettifyNumber(cellData.value),
        minWidth: 130,
      },
      {
        id: 'value',
        Header: 'Value',
        accessor: 'value',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        minWidth: 130,
      },
      {
        id: 'breakdown',
        Header: 'Reserve Breakdown',
        accessor: 'tkn',
        Cell: (cellData) => PoolTokensCellReserve(cellData.row.original),
        minWidth: 130,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'converter',
        Cell: (cellData) => PoolTokensCellActions(cellData.row.original),
        minWidth: 130,
      },
    ],
    []
  );

  return (
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>Pool Tokens</h2>
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

      <DataTable<PoolToken>
        data={data}
        columns={columns}
        isLoading={!data.length}
        stickyColumn
      />
    </section>
  );
};

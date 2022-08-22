import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { useAppSelector } from 'store';
import { prettifyNumber } from 'utils/helperFunctions';
import { PoolTokensCellActions } from './PoolTokensCellActions';
import { PoolTokensCellName } from './PoolTokensCellName';
import { PoolTokensCellReserve } from './PoolTokensCellReserve';
import { PoolToken } from 'services/observables/pools';
import { sorAlphaByKey, sortNumbersByKey } from 'utils/pureFunctions';

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
        sortType: (a, b) =>
          sorAlphaByKey(a.original, b.original, ['tkn', 'token', 'symbol']),
        minWidth: 130,
      },
      {
        id: 'amount',
        Header: 'Amount',
        accessor: 'amount',
        Cell: (cellData) => <>{prettifyNumber(cellData.value)}</>,
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['amount']),
        minWidth: 130,
      },
      {
        id: 'value',
        Header: 'Value',
        accessor: 'value',
        Cell: (cellData) => <>{prettifyNumber(cellData.value, true)}</>,
        sortType: (a, b) => sortNumbersByKey(a.original, b.original, ['value']),
        minWidth: 130,
      },
      {
        id: 'breakdown',
        Header: 'Reserve Breakdown',
        accessor: 'tkn',
        Cell: (cellData) => PoolTokensCellReserve(cellData.row.original),
        disableSortBy: true,
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
    <section className="pt-20 pb-10 content-section">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>Pool Tokens</h2>
        <div className="relative">
          <IconSearch className="absolute w-16 ml-14 text-graphite" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="block w-full max-w-[160px] border border-silver rounded-10 pl-[38px] h-[35px] dark:bg-charcoal dark:border-grey focus:border-primary"
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

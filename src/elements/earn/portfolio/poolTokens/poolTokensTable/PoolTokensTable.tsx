import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';

export const PoolTokensTable = () => {
  const [search, setSearch] = useState('');

  const data: any[] = [];
  const columns = useMemo<TableColumn<any>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'amount',
        Header: 'Amount',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'value',
        Header: 'Value',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'breakdown',
        Header: 'Reserve Breakdown',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        minWidth: 130,
        sortDescFirst: true,
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

      <DataTable<any>
        data={data}
        columns={columns}
        isLoading={!data.length}
        stickyColumn
      />
    </section>
  );
};

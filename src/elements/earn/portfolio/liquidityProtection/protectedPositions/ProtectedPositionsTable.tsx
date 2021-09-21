import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';

export const ProtectedPositionsTable = () => {
  const [search, setSearch] = useState('');

  const data: any[] = [];
  const columns = useMemo<TableColumn<any>[]>(
    () => [
      {
        id: 'liquidity',
        Header: 'Liquidity',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'initalStake',
        Header: 'Initial Stake',
        minWidth: 130,
        sortDescFirst: true,
        tooltip: 'Amount of tokens you originally staked in the pool',
      },
      {
        id: 'protected',
        Header: 'Protected',
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Amount of tokens you can withdraw with 100% protection + fees',
      },
      {
        id: 'claimable',
        Header: 'Claimable',
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Amount of tokens you can withdraw right now (assuming you have not earned full protection, this value will be lower than Protected Value)',
      },
      {
        id: 'feesRewards',
        Header: 'Fees & Rewards',
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Fees and rewards earned by your stake since you entered the pool.',
      },
      {
        id: 'roi',
        Header: 'ROI',
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'The ROI of your fully protected value vs. your initial stake.',
      },
      {
        id: 'apr',
        Header: 'APR',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'coverage',
        Header: 'Current Coverage',
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'The impermanent loss protection you have accrued. Impermanent loss protection starts 30 days after your deposit, at a rate of 30% and gradually increases 1% per day until you reach 100% protection.',
      },
    ],
    []
  );

  return (
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>My Protected Positions</h2>
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

import { Pool } from 'services/observables/tokens';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo } from 'react';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { ReactComponent as IconMenuDots } from 'assets/icons/menu-dots.svg';

export const V3EarningTable = () => {
  const data: any = [1, 2, 3, 4];

  const columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: '',
        accessor: 'name',
        Cell: () => (
          <TokenBalance
            symbol="ETH"
            amount={'123123'}
            imgUrl={''}
            usdPrice={'1.123'}
          />
        ),
        minWidth: 225,
        disableSortBy: true,
      },
      {
        id: 'totalGains',
        Header: 'Total gains',
        Cell: () => 'ETH 123123',
        tooltip: 'Tooltip text',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'roi',
        Header: 'Total returns',
        Cell: () => <span className="text-primary">7.5%</span>,
        tooltip: 'Tooltip text',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        Cell: () => (
          <button>
            <IconMenuDots className="w-20" />
          </button>
        ),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );
  return (
    <section className="content-block pt-20">
      <div className="absolute z-30 pt-10 pl-40">
        <h2 className="text-[22px]">Earnings</h2>
      </div>

      <DataTable<any> data={data} columns={columns} stickyColumn />
    </section>
  );
};

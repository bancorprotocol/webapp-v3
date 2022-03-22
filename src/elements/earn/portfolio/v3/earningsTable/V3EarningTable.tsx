import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import V3WithdrawModal from 'elements/earn/portfolio/v3/withdraw/V3WithdrawModal';
import { V3EarningTableMenu } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useAppSelector } from 'redux/index';
import { getPortfolioHoldings } from 'redux/portfolio/v3Portfolio';
import { Holding } from 'redux/portfolio/v3Portfolio.types';

export const V3EarningTable = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const holdings = useAppSelector(getPortfolioHoldings);

  const columns = useMemo<TableColumn<Holding>[]>(
    () => [
      {
        id: 'poolId',
        Header: '',
        accessor: 'poolId',
        Cell: ({ cell }) => (
          <TokenBalance
            symbol={cell.row.original.token.symbol}
            amount={cell.row.original.tokenBalance}
            imgUrl={cell.row.original.token.logoURI}
            usdPrice={cell.row.original.token.usdPrice ?? '0'}
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
          <V3EarningTableMenu setIsWithdrawModalOpen={setIsWithdrawModalOpen} />
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

      <DataTable<Holding> data={holdings} columns={columns} stickyColumn />

      <V3WithdrawModal
        isOpen={isWithdrawModalOpen}
        setIsOpen={setIsWithdrawModalOpen}
      />
    </section>
  );
};

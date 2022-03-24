import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import V3WithdrawModal from 'elements/earn/portfolio/v3/initWithdraw/V3WithdrawModal';
import { V3EarningTableMenu } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useAppSelector } from 'redux/index';
import { getPortfolioHoldings } from 'redux/portfolio/v3Portfolio';
import { Holding } from 'redux/portfolio/v3Portfolio.types';

export const V3EarningTable = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [holdingToWithdraw, setHoldingToWithdraw] = useState<Holding | null>(
    null
  );

  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector<boolean>(
    (state) => state.v3Portfolio.isLoadingHoldings
  );

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
        accessor: 'poolId',
        Cell: ({ cell }) => (
          <V3EarningTableMenu
            holding={cell.row.original}
            setIsWithdrawModalOpen={setIsWithdrawModalOpen}
            setHoldingToWithdraw={setHoldingToWithdraw}
          />
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

      <DataTable<Holding>
        data={holdings}
        columns={columns}
        stickyColumn
        isLoading={isLoadingHoldings}
      />

      {holdingToWithdraw && (
        <V3WithdrawModal
          isOpen={isWithdrawModalOpen}
          setIsOpen={setIsWithdrawModalOpen}
          holdingToWithdraw={holdingToWithdraw}
        />
      )}
    </section>
  );
};

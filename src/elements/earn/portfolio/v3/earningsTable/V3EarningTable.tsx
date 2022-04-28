import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import V3WithdrawModal from 'elements/earn/portfolio/v3/initWithdraw/V3WithdrawModal';
import { V3EarningTableMenu } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useAppSelector } from 'store';
import {
  getIsLoadingHoldings,
  getPortfolioHoldings,
} from 'store/portfolio/v3Portfolio';
import { Holding } from 'store/portfolio/v3Portfolio.types';

export const V3EarningTable = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [holdingToWithdraw, setHoldingToWithdraw] = useState<Holding>();

  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);

  const columns = useMemo<TableColumn<Holding>[]>(
    () => [
      {
        id: 'poolId',
        Header: 'Balance',
        accessor: 'poolId',
        Cell: ({ cell }) => (
          <TokenBalance
            symbol={cell.row.original.token.symbol}
            amount={cell.row.original.combinedTokenBalance}
            imgUrl={cell.row.original.token.logoURI}
            usdPrice={cell.row.original.token.usdPrice ?? '0'}
          />
        ),
        minWidth: 225,
        disableSortBy: true,
      },
      {
        id: 'totalGains',
        Header: 'Lifetime gains',
        Cell: () => '????',
        tooltip: 'Tooltip text',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'roi',
        Header: 'Lifetime Bonuses',
        Cell: () => <span className="text-primary">????%</span>,
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
    <section>
      <h2>Holdings</h2>

      <div className="content-block pt-10 mt-20">
        <DataTable<Holding>
          data={holdings}
          columns={columns}
          stickyColumn
          isLoading={isLoadingHoldings}
        />
      </div>

      {holdingToWithdraw && (
        <V3WithdrawModal
          isOpen={isWithdrawModalOpen}
          setIsOpen={setIsWithdrawModalOpen}
          holding={holdingToWithdraw}
        />
      )}
    </section>
  );
};

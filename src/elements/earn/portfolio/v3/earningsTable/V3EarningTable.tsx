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
import { DepositV3Modal } from 'elements/earn/pools/poolsTable/v3/DepositV3Modal';
import { SortingRule } from 'react-table';

export const V3EarningTable = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [holdingToWithdraw, setHoldingToWithdraw] = useState<Holding>();

  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);

  const columns = useMemo<TableColumn<Holding>[]>(
    () => [
      {
        id: 'balance',
        Header: 'Balance',
        accessor: 'poolTokenBalance',
        Cell: ({ cell }) => (
          <TokenBalance
            symbol={cell.row.original.pool.reserveToken.symbol}
            amount={cell.row.original.combinedTokenBalance}
            imgUrl={cell.row.original.pool.reserveToken.logoURI}
            usdPrice={cell.row.original.pool.reserveToken.usdPrice}
          />
        ),
        sortType: (a, b) => {
          const usdPriceA =
            Number(a.original.combinedTokenBalance) *
              Number(a.original.pool.reserveToken.usdPrice) ?? 0;
          const usdPriceB =
            Number(b.original.combinedTokenBalance) *
              Number(b.original.pool.reserveToken.usdPrice) ?? 0;
          return usdPriceA - usdPriceB;
        },

        minWidth: 225,
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
        accessor: 'poolTokenBalance',
        Cell: ({ cell }) => (
          <DepositV3Modal
            pool={cell.row.original.pool}
            renderButton={(onClick) => (
              <V3EarningTableMenu
                holding={cell.row.original}
                handleDepositClick={onClick}
                setIsWithdrawModalOpen={setIsWithdrawModalOpen}
                setHoldingToWithdraw={setHoldingToWithdraw}
              />
            )}
          />
        ),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );

  const defaultSort: SortingRule<Holding> = {
    id: 'balance',
    desc: true,
  };

  return (
    <section>
      <h2>Holdings</h2>

      <div className="content-block pt-10 mt-20">
        <DataTable<Holding>
          data={holdings}
          columns={columns}
          stickyColumn
          isLoading={isLoadingHoldings}
          defaultSort={defaultSort}
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

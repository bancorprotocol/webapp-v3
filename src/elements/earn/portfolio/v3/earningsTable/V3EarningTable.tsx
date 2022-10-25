import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo } from 'react';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { V3EarningTableMenu } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useAppSelector } from 'store';
import {
  getIsLoadingHoldings,
  getPortfolioHoldings,
} from 'store/portfolio/v3Portfolio';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { SortingRule } from 'react-table';
import { shrinkToken } from 'utils/formulas';
import { prettifyNumber } from 'utils/helperFunctions';
import { useModal } from 'hooks/useModal';
import { ModalNames } from 'modals';

export const V3EarningTable = () => {
  const { pushModal } = useModal();

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
        id: 'roi',
        Header: 'Bonuses',
        accessor: 'poolTokenBalance',
        Cell: ({ cell }) => (
          <span>
            {prettifyNumber(
              shrinkToken(
                cell.row.original.latestProgram?.pendingRewardsWei || 0,
                cell.row.original.latestProgram?.rewardsToken.decimals || 0
              )
            )}{' '}
            {cell.row.original.latestProgram?.rewardsToken.symbol}
          </span>
        ),
        tooltip: 'External bonuses available to be claimed',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'poolTokenBalance',
        Cell: ({ cell }) => (
          <div className="flex items-center">
            <V3EarningTableMenu
              holding={cell.row.original}
              handleDepositClick={() =>
                pushModal({
                  modalName: ModalNames.DepositV3,
                  data: { pool: cell.row.original.pool },
                })
              }
            />
          </div>
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

      <div className="pt-10 mt-20 content-block">
        <DataTable<Holding>
          data={holdings}
          columns={columns}
          stickyColumn
          isLoading={isLoadingHoldings}
          defaultSort={defaultSort}
        />
      </div>
    </section>
  );
};

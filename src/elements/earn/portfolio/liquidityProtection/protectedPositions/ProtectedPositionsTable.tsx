import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo } from 'react';
import { ProtectedPositionTableCellAmount } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellStake';
import { prettifyNumber } from 'utils/helperFunctions';
import { useProtectedPositions } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/useProtectedPositions';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';

export const ProtectedPositionsTable = () => {
  const { groupedPositions, search, setSearch } = useProtectedPositions();

  const data = useMemo(() => groupedPositions, [groupedPositions]);
  const columns = useMemo<TableColumn<ProtectedPositionGrouped>[]>(
    () => [
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'pool',
        Cell: (cellData) => cellData.row.original.pool.name,
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'initialStake',
        accessor: 'initialStake',
        Header: 'Initial Stake',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        minWidth: 130,
        sortDescFirst: true,
        tooltip: 'Amount of tokens you originally staked in the pool',
      },
      {
        id: 'protected',
        accessor: 'protectedAmount',
        Header: 'Protected',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Amount of tokens you can withdraw with 100% protection + fees',
      },
      {
        id: 'claimable',
        accessor: 'claimableAmount',
        Header: 'Claimable',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Amount of tokens you can withdraw right now (assuming you have not earned full protection, this value will be lower than Protected Value)',
      },
      {
        id: 'feesRewards',
        accessor: 'rewardsMultiplier',
        Header: 'Fees & Rewards',
        Cell: (cellData) => {
          const row = cellData.row.original;
          return `${prettifyNumber(row.fees)} ${row.reserveToken.symbol} | X${
            row.rewardsMultiplier
          }`;
        },
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Fees and rewards earned by your stake since you entered the pool.',
      },
      {
        id: 'roi',
        accessor: 'roi',
        Header: 'ROI',
        Cell: (cellData) => `${(Number(cellData.value) * 100).toFixed(2)} %`,
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'The ROI of your fully protected value vs. your initial stake.',
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'aprs',
        Cell: (cellData) => {
          return (
            <div>
              <div>Day {(Number(cellData.value.day) * 100).toFixed(2)} %</div>
              <div>Week {(Number(cellData.value.week) * 100).toFixed(2)} %</div>
            </div>
          );
        },
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
      {
        id: 'expander',
        accessor: 'subRows',
        Cell: ({ row }) =>
          row.canExpand ? (
            <span {...row.getToggleRowExpandedProps()}>
              {row.isExpanded ? 'close' : 'open'}
            </span>
          ) : (
            <button>withdraw</button>
          ),
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

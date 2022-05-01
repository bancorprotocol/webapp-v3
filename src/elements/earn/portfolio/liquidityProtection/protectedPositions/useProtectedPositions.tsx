import { useAppSelector } from 'store';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { useMemo, useState } from 'react';
import { TableColumn } from 'components/table/DataTable';
import { ProtectedPositionTableCellLiquidity } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellLiquidity';
import { ProtectedPositionTableCellAmount } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellStake';
import { ProtectedPositionTableCellFees } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellFees';
import { ProtectedPositionTableCellRoi } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellRoi';
import { getGroupedPositions } from 'store/liquidity/liquidity';
import { ProtectedPositionTableCellActions } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellActions';
import { ProtectedPositionTableCellClaimable } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellClaimable';
import { sorAlphaByKey, sortNumbersByKey } from 'utils/pureFunctions';

export const useProtectedPositions = () => {
  const groupedPositions =
    useAppSelector<ProtectedPositionGrouped[]>(getGroupedPositions);
  const [search, setSearch] = useState('');

  const data = useMemo(
    () =>
      groupedPositions.filter((pos) =>
        pos.reserveToken.symbol.toLowerCase().includes(search.toLowerCase())
      ),
    [groupedPositions, search]
  );
  const columns = useMemo<TableColumn<ProtectedPositionGrouped>[]>(
    () => [
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'pool',
        Cell: (cellData) =>
          ProtectedPositionTableCellLiquidity(cellData.row.original),
        sortType: (a, b) =>
          sorAlphaByKey(a.original, b.original, ['reserveToken', 'symbol']),
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
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, [
            'initialStake',
            'usdAmount',
          ]),
        minWidth: 130,
        sortDescFirst: true,
        headerClassName: 'justify-center',
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
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, [
            'protectedAmount',
            'usdAmount',
          ]),
        minWidth: 130,
        sortDescFirst: true,
        headerClassName: 'justify-center',
        tooltip:
          'Amount of tokens you can withdraw with 100% protection + fees',
      },
      {
        id: 'claimable',
        accessor: 'claimableAmount',
        Header: 'Claimable',
        Cell: (cellData) => ProtectedPositionTableCellClaimable(cellData.row),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, [
            'claimableAmount',
            'usdAmount',
          ]),
        minWidth: 130,
        sortDescFirst: true,
        headerClassName: 'justify-center',
        tooltip:
          'Amount of tokens you can withdraw right now (assuming you have not earned full protection, this value will be lower than Protected Value)',
      },
      {
        id: 'feesRewards',
        accessor: 'rewardsMultiplier',
        Header: 'Fees & Rewards',
        Cell: (cellData) =>
          ProtectedPositionTableCellFees(cellData.row.original),
        sortType: (a, b) => sortNumbersByKey(a.original, b.original, ['fees']),
        minWidth: 130,
        sortDescFirst: true,
        headerClassName: 'justify-center',
        tooltip:
          'Fees and rewards earned by your stake since you entered the pool.',
      },
      {
        id: 'roi',
        accessor: 'roi',
        Header: 'ROI',
        Cell: (cellData) =>
          ProtectedPositionTableCellRoi(cellData.row.original),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['roi', 'fees']),
        minWidth: 130,
        headerClassName: 'justify-center',
        tooltip:
          'The ROI of your fully protected value vs. your initial stake.',
      },
      // {
      //   id: 'apr',
      //   Header: 'APR',
      //   accessor: 'aprs',
      //   Cell: (cellData) => {
      //     return (
      //       <div>
      //         <div>Day {(Number(cellData.value.day) * 100).toFixed(2)} %</div>
      //         <div>Week {(Number(cellData.value.week) * 100).toFixed(2)} %</div>
      //       </div>
      //     );
      //   },
      //   minWidth: 130,
      //   sortDescFirst: true,
      // },
      {
        id: 'expander',
        disableSortBy: true,
        accessor: 'subRows',
        minWidth: 250,
        width: 250,
        Cell: (cellData) => ProtectedPositionTableCellActions(cellData),
      },
    ],
    []
  );

  return { search, setSearch, data, columns };
};

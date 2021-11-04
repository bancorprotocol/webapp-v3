import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';
import {
  fetchProtectedPositions,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { useDispatch } from 'react-redux';
import { getGroupedPositions, setPositions } from 'redux/bancor/position';
import { useMemo, useState } from 'react';
import { TableColumn } from 'components/table/DataTable';
import { ProtectedPositionTableCellLiquidity } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellLiquidity';
import { ProtectedPositionTableCellAmount } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellStake';
import { ProtectedPositionTableCellFees } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellFees';
import { ProtectedPositionTableCellRoi } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellRoi';

export const useProtectedPositions = () => {
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);
  const groupedPositions =
    useAppSelector<ProtectedPositionGrouped[]>(getGroupedPositions);
  const { account } = useWeb3React();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');

  useAsyncEffect(async () => {
    if (account && pools.length) {
      const positions = await fetchProtectedPositions(pools, account);
      dispatch(setPositions(positions));
    }
  }, [account, pools.length]);

  const data = useMemo(() => groupedPositions, [groupedPositions]);
  const columns = useMemo<TableColumn<ProtectedPositionGrouped>[]>(
    () => [
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'pool',
        Cell: (cellData) =>
          ProtectedPositionTableCellLiquidity(cellData.row.original),
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
        Cell: (cellData) =>
          ProtectedPositionTableCellFees(cellData.row.original),
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Fees and rewards earned by your stake since you entered the pool.',
      },
      {
        id: 'roi',
        accessor: 'roi',
        Header: 'ROI',
        Cell: (cellData) =>
          ProtectedPositionTableCellRoi(cellData.row.original),
        minWidth: 130,
        sortDescFirst: true,
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

  return { search, setSearch, data, columns };
};

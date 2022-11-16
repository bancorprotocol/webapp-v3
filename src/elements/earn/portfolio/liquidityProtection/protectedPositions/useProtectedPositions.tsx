import { useAppSelector } from 'store';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { useMemo, useState } from 'react';
import { TableColumn } from 'components/table/DataTable';
import { ProtectedPositionTableCellLiquidity } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellLiquidity';
import { ProtectedPositionTableCellAmount } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellStake';
import { getGroupedPositions } from 'store/liquidity/liquidity';
import { ProtectedPositionTableCellActions } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellActions';
import { sorAlphaByKey, sortNumbersByKey } from 'utils/pureFunctions';
import { ProtectedPositionTableCellClaimable } from './ProtectedPositionTableCellClaimable';

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
        Header: 'Name',
        accessor: 'pool',
        Cell: (cellData) =>
          ProtectedPositionTableCellLiquidity(cellData.row.original),
        sortType: (a, b) =>
          sorAlphaByKey(a.original, b.original, ['reserveToken', 'symbol']),
        minWidth: 200,
        width: 200,
        sortDescFirst: true,
      },
      {
        id: 'initialStake',
        accessor: 'initialStake',
        Header: 'Position',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
            deficitAmountTKN: cellData.row.original.claimableAmount.tknAmount,
            deficitAmountUSD: cellData.row.original.claimableAmount.usdAmount,
          }),
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, [
            'initialStake',
            'usdAmount',
          ]),
        minWidth: 130,
        maxWidth: 130,
        sortDescFirst: true,
        tooltip: 'Amount of tokens you originally staked in the pool',
      },
      {
        id: 'claimableAmount',
        Header: 'Claimable Amount',
        accessor: 'claimableAmount',
        Cell: (cellData) =>
          ProtectedPositionTableCellClaimable({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        sortType: (a, b) =>
          sorAlphaByKey(a.original, b.original, [
            'claimableAmount',
            'usdAmount',
          ]),
        minWidth: 130,
        width: 130,
        sortDescFirst: true,
      },
      {
        id: 'vaultBalance',
        accessor: 'vaultBalance',
        Header: 'Vault Balance',
        Cell: (cellData) => (
          <div
            className={`${cellData.value > 0 ? 'text-primary' : 'text-error'}`}
          >
            {cellData.value}%
          </div>
        ),
        minWidth: 130,
        sortDescFirst: true,
        tooltip: 'The % of tokens currently available',
      },
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

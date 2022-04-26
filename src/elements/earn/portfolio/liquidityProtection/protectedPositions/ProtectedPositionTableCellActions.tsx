import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button } from 'components/button/Button';
import { migrateV2Positions } from 'services/web3/protection/migration';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const { row } = cellData;
  const position = row.original;

  const singleContent = useMemo(
    () => (
      <Button
        onClick={() => migrateV2Positions([position])}
        className="text-12 w-[165px] h-[32px]"
      >
        Upgrade To V3
      </Button>
    ),
    [position]
  );

  const groupContent = useMemo(
    () => (
      <Button
        onClick={() => migrateV2Positions(position.subRows)}
        className="text-12 w-[145px] h-[32px]"
      >
        Upgrade All To V3
      </Button>
    ),
    [position]
  );

  return (
    <div>
      {TableCellExpander({
        cellData,
        singleContent,
        groupContent,
      })}
    </div>
  );
};

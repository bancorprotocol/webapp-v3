import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useMemo } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button, ButtonVariant } from 'components/button/Button';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const singleContent = useMemo(() => {
    return (
      <Button
        onClick={() => {}}
        disabled={true}
        className="text-12 w-[120px] h-[32px] mr-10"
        variant={ButtonVariant.Secondary}
      >
        Withdraw
      </Button>
    );
  }, []);

  return (
    <div>
      {TableCellExpander({
        cellData,
        singleContent,
      })}
    </div>
  );
};

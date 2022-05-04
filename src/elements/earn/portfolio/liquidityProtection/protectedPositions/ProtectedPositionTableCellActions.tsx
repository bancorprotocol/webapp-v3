import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useMemo, useState } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button } from 'components/button/Button';
import { migrateV2Positions } from 'services/web3/protection/migration';
import {
  migrateFailedNotification,
  migrateNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { WithdrawLiquidityWidget } from '../../withdrawLiquidity/WithdrawLiquidityWidget';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isOpen, setOpen] = useState(false);
  const { row } = cellData;
  const position = row.original;
  const dispatch = useDispatch();

  const singleContent = useMemo(
    () => (
      <Button
        onClick={() =>
          migrateV2Positions(
            [position],
            (txHash: string) => migrateNotification(dispatch, txHash),
            () => {},
            () => rejectNotification(dispatch),
            () => migrateFailedNotification(dispatch)
          )
        }
        className="text-12 w-[165px] h-[32px]"
      >
        Upgrade To V3
      </Button>
    ),
    [position, dispatch]
  );

  const groupContent = useMemo(
    () => (
      <Button
        onClick={() =>
          migrateV2Positions(
            position.subRows,
            (txHash: string) => migrateNotification(dispatch, txHash),
            () => {},
            () => rejectNotification(dispatch),
            () => migrateFailedNotification(dispatch)
          )
        }
        className="text-12 w-[145px] h-[32px]"
      >
        Upgrade All To V3
      </Button>
    ),
    [position, dispatch]
  );
  return (
    <div>
      {TableCellExpander({
        cellData,
        singleContent,
        groupContent,
        subMenu: () => setOpen(true),
      })}
      <WithdrawLiquidityWidget
        protectedPosition={position}
        isModalOpen={isOpen}
        setIsModalOpen={setOpen}
      />
    </div>
  );
};

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
import { UpgradeBntModal } from '../../v3/UpgradeBntModal';
import { bntToken } from 'services/web3/config';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isOpenWithdraw, setIsOpenWithdraw] = useState(false);
  const [isOpenBnt, setIsOpenBnt] = useState(false);
  const { row } = cellData;
  const position = row.original;
  const dispatch = useDispatch();

  const migrate = (positions: ProtectedPosition[]) => {
    const isBnt = positions[0].reserveToken.address === bntToken;
    if (isBnt) setIsOpenBnt(true);
    else
      migrateV2Positions(
        positions,
        (txHash: string) => migrateNotification(dispatch, txHash),
        () => {},
        () => rejectNotification(dispatch),
        () => migrateFailedNotification(dispatch)
      );
  };
  const singleContent = useMemo(
    () => (
      <Button
        onClick={() => migrate([position])}
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
        onClick={() => migrate(position.subRows)}
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
        subMenu: () => setIsOpenWithdraw(true),
      })}
      <WithdrawLiquidityWidget
        protectedPosition={position}
        isModalOpen={isOpenWithdraw}
        setIsModalOpen={setIsOpenWithdraw}
      />
      <UpgradeBntModal
        isOpen={isOpenBnt}
        setIsOpen={setIsOpenBnt}
        position={position}
      />
    </div>
  );
};

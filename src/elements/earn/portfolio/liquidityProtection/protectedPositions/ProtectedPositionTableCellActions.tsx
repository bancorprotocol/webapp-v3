import {
  fetchProtectedPositions,
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
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
import {
  getAllBntPositionsAndAmount,
  setProtectedPositions,
} from 'store/liquidity/liquidity';
import { Pool } from 'services/observables/pools';
import { useAppSelector } from 'store';
import { getIsV3Exist } from 'store/bancor/pool';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isOpenWithdraw, setIsOpenWithdraw] = useState(false);
  const [isOpenBnt, setIsOpenBnt] = useState(false);
  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);
  const { row } = cellData;
  const position = row.original;
  const isPoolExistV3 = useAppSelector<boolean>((state) =>
    getIsV3Exist(state, position.reserveToken.address)
  );
  const totalBNT = useAppSelector<{
    usdAmount: number;
    tknAmount: number;
    bntPositions: ProtectedPosition[];
  }>(getAllBntPositionsAndAmount);
  const protocolBnBNTAmount = useAppSelector<number>(
    (state) => state.liquidity.protocolBnBNTAmount
  );
  const dispatch = useDispatch();

  const isMigrateDisabled = useCallback(
    (positions: ProtectedPosition[]) => {
      if (!positions || positions.length === 0) return true;

      const totalAmount = positions
        .map((x) => Number(x.protectedAmount.tknAmount))
        .reduce((sum, current) => sum + current, 0);

      return (
        positions[0].reserveToken.address === bntToken &&
        protocolBnBNTAmount < totalAmount
      );
    },
    [protocolBnBNTAmount]
  );

  const migrate = useCallback(
    (positions: ProtectedPosition[]) => {
      const isBnt = positions[0].reserveToken.address === bntToken;
      if (isBnt && protocolBnBNTAmount > totalBNT.tknAmount) setIsOpenBnt(true);
      else
        migrateV2Positions(
          positions,
          (txHash: string) => migrateNotification(dispatch, txHash),
          async () => {
            const positions = await fetchProtectedPositions(pools, account!);
            dispatch(setProtectedPositions(positions));
          },
          () => rejectNotification(dispatch),
          () => migrateFailedNotification(dispatch)
        );
    },
    [dispatch, account, pools, totalBNT.tknAmount, protocolBnBNTAmount]
  );

  const singleContent = useMemo(() => {
    const disabled = isMigrateDisabled([position]);
    const button = (
      <Button
        onClick={() => migrate([position])}
        className="text-12 w-[165px] h-[32px] mr-10"
        disabled={disabled}
      >
        Upgrade To V3
      </Button>
    );
    return isPoolExistV3 ? (
      disabled ? (
        <PopoverV3 buttonElement={() => button}>
          Hold tight, migration will be available again shortly
        </PopoverV3>
      ) : (
        button
      )
    ) : (
      <></>
    );
  }, [position, migrate, isPoolExistV3, isMigrateDisabled]);

  const groupContent = useMemo(() => {
    const disabled = isMigrateDisabled(position.subRows);
    const button = (
      <Button
        onClick={() => migrate(position.subRows)}
        className="text-12 w-[145px] h-[32px] mr-10"
        disabled={disabled}
      >
        Upgrade All To V3
      </Button>
    );
    return isPoolExistV3 ? (
      disabled ? (
        <PopoverV3 buttonElement={() => button}>
          Hold tight, migration will be available again shortly
        </PopoverV3>
      ) : (
        button
      )
    ) : (
      <></>
    );
  }, [position, migrate, isPoolExistV3, isMigrateDisabled]);
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

import {
  fetchProtectedPositions,
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button } from 'components/button/Button';
import { bntToken } from 'services/web3/config';
import {
  getAllBntPositionsAndAmount,
  setProtectedPositions,
} from 'store/liquidity/liquidity';
import { useAppSelector } from 'store';
import { getIsV3Exist } from 'store/bancor/pool';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useDispatch } from 'react-redux';
import {
  migrateNotification,
  rejectNotification,
  migrateFailedNotification,
} from 'services/notifications/notifications';
import { Pool } from 'services/observables/pools';
import { migrateV2Positions } from 'services/web3/protection/migration';
import { useModal } from 'hooks/useModal';
import { ModalNames } from 'modals';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const dispatch = useDispatch();
  const { pushModal } = useModal();
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

  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);

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
      if (isBnt && protocolBnBNTAmount > totalBNT.tknAmount) {
        const poolID =
          totalBNT.bntPositions.length > 0
            ? totalBNT.bntPositions[0].pool.pool_dlt_id
            : '';
        if (totalBNT.bntPositions.every((x) => x.pool.pool_dlt_id === poolID))
          migrateV2Positions(
            totalBNT.bntPositions,
            (txHash: string) => migrateNotification(dispatch, txHash),
            async () => {
              const positions = await fetchProtectedPositions(pools, account!);
              dispatch(setProtectedPositions(positions));
            },
            () => rejectNotification(dispatch),
            () => migrateFailedNotification(dispatch)
          );
        else
          pushModal({
            modalName: ModalNames.UpgradeBnt,
            data: { position },
          });
      } else {
        pushModal({
          modalName: ModalNames.UpgradeTkn,
          data: { positions },
        });
      }
    },
    [
      totalBNT.tknAmount,
      totalBNT.bntPositions,
      protocolBnBNTAmount,
      account,
      dispatch,
      pushModal,
      pools,
      position,
    ]
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
        subMenu: () => pushModal({ modalName: ModalNames.WithdrawLiquidity }),
      })}
    </div>
  );
};

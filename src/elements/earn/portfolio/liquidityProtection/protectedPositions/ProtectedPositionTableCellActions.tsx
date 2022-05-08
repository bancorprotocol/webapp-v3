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
import { setProtectedPositions } from 'store/liquidity/liquidity';
import { Pool } from 'services/observables/pools';
import { useAppSelector } from 'store';
import { getIsV3Exist } from 'store/bancor/pool';
import { useNavigation } from 'hooks/useNavigation';

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
  const { goToPage } = useNavigation();
  const dispatch = useDispatch();

  const migrate = useCallback(
    (positions: ProtectedPosition[]) => {
      const isBnt = positions[0].reserveToken.address === bntToken;
      if (isBnt) setIsOpenBnt(true);
      else
        migrateV2Positions(
          positions,
          (txHash: string) => migrateNotification(dispatch, txHash),
          async () => {
            const positions = await fetchProtectedPositions(pools, account!);
            dispatch(setProtectedPositions(positions));
            goToPage.portfolio();
          },
          () => rejectNotification(dispatch),
          () => migrateFailedNotification(dispatch)
        );
    },
    [dispatch, account, pools, goToPage]
  );

  const singleContent = useMemo(
    () =>
      isPoolExistV3 ? (
        <Button
          onClick={() => migrate([position])}
          className="text-12 w-[165px] h-[32px]"
        >
          Upgrade To V3
        </Button>
      ) : (
        <></>
      ),
    [position, migrate, isPoolExistV3]
  );

  const groupContent = useMemo(
    () =>
      isPoolExistV3 ? (
        <Button
          onClick={() => migrate(position.subRows)}
          className="text-12 w-[145px] h-[32px]"
        >
          Upgrade All To V3
        </Button>
      ) : (
        <></>
      ),
    [position, migrate, isPoolExistV3]
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

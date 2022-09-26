import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button } from 'components/button/Button';
import { WithdrawLiquidityWidget } from '../../withdrawLiquidity/WithdrawLiquidityWidget';
import { UpgradeBntModal } from '../../v3/UpgradeBntModal';
import { bntToken } from 'services/web3/config';
import { getAllBntPositionsAndAmount } from 'store/liquidity/liquidity';
import { useAppSelector } from 'store';
import { getIsV3Exist } from 'store/bancor/pool';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { UpgradeTknModal } from '../../v3/UpgradeTknModal';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isOpenWithdraw, setIsOpenWithdraw] = useState(false);
  const [isOpenBnt, setIsOpenBnt] = useState(false);
  const [isOpenTkn, setIsOpenTkn] = useState(false);
  const { row } = cellData;
  const position = row.original;
  const [SelectedPositions, setSelectedPositions] = useState<
    ProtectedPosition[]
  >([]);
  const isPoolExistV3 = useAppSelector((state) =>
    getIsV3Exist(state, position.reserveToken.address)
  );
  const totalBNT = useAppSelector(getAllBntPositionsAndAmount);
  const protocolBnBNTAmount = useAppSelector(
    (state) => state.liquidity.protocolBnBNTAmount
  );

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
        setIsOpenBnt(true);
      } else {
        setSelectedPositions(positions);
        setIsOpenTkn(true);
      }
    },
    [totalBNT.tknAmount, protocolBnBNTAmount]
  );

  const singleContent = useMemo(() => {
    const disabled = isMigrateDisabled([position]);
    const button = (
      <Button
        onClick={() => migrate([position])}
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
  }, [isMigrateDisabled, position, migrate, isPoolExistV3]);

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
  }, [isMigrateDisabled, position, isPoolExistV3, migrate]);
  return (
    <div>
      {TableCellExpander({
        cellData,
        singleContent,
        groupContent,
        subMenu: () => setIsOpenWithdraw(true),
      })}
      <WithdrawLiquidityWidget
        isModalOpen={isOpenWithdraw}
        setIsModalOpen={setIsOpenWithdraw}
      />
      <UpgradeTknModal
        isOpen={isOpenTkn}
        setIsOpen={setIsOpenTkn}
        positions={SelectedPositions}
      />
      <UpgradeBntModal
        isOpen={isOpenBnt}
        setIsOpen={setIsOpenBnt}
        position={position}
      />
    </div>
  );
};

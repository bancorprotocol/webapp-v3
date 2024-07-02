import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useMemo, useState } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button, ButtonVariant } from 'components/button/Button';
import { WithdrawLiquidityWidget } from '../../withdrawLiquidity/WithdrawLiquidityWidget';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isOpenWithdraw, setIsOpenWithdraw] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<ProtectedPosition>();

  const { row } = cellData;
  const position = row.original;

  const singleContent = useMemo(() => {
    return (
      <Button
        onClick={() => {
          setSelectedPosition(position);
          setIsOpenWithdraw(true);
        }}
        className="text-12 w-[120px] h-[32px] mr-10"
        variant={ButtonVariant.Secondary}
      >
        Withdraw
      </Button>
    );
  }, [position]);

  return (
    <div>
      {TableCellExpander({
        cellData,
        singleContent,
      })}
      {selectedPosition && (
        <WithdrawLiquidityWidget
          protectedPosition={selectedPosition}
          isModalOpen={isOpenWithdraw}
          setIsModalOpen={setIsOpenWithdraw}
        />
      )}
    </div>
  );
};

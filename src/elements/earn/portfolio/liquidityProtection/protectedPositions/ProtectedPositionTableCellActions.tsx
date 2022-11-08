import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { PropsWithChildren, useMemo, useState } from 'react';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { Button } from 'components/button/Button';
import { WithdrawLiquidityWidget } from '../../withdrawLiquidity/WithdrawLiquidityWidget';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isOpenWithdraw, setIsOpenWithdraw] = useState(false);
  const [SelectedPositions, setSelectedPositions] = useState<
    ProtectedPosition[]
  >([]);

  const { row } = cellData;
  const position = row.original;

  const singleContent = useMemo(() => {
    return (
      <Button
        onClick={() => {
          setSelectedPositions([position]);
          setIsOpenWithdraw(true);
        }}
        className="text-12 w-[120px] h-[32px] mr-10"
      >
        Withdraw
      </Button>
    );
  }, [position]);

  const groupContent = useMemo(() => {
    return (
      <Button
        onClick={() => {
          setSelectedPositions(position.subRows);
          setIsOpenWithdraw(true);
        }}
        className="text-12 w-[120px] h-[32px] mr-10"
      >
        Withdraw All
      </Button>
    );
  }, [position]);
  return (
    <div>
      {TableCellExpander({
        cellData,
        singleContent,
        groupContent,
      })}
      <WithdrawLiquidityWidget
        isModalOpen={isOpenWithdraw}
        setIsModalOpen={setIsOpenWithdraw}
      />
    </div>
  );
};

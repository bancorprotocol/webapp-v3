import { ProtectedPositionGrouped } from 'services/web3/protection/positions';

export const ProtectedPositionTableCellRoi = (
  position: ProtectedPositionGrouped
) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center font-medium h-24">
        {(Number(position.roi) * 100).toFixed(2)} %
      </div>
      <div className="text-12 text-primary mt-4 bg-blue-0 rounded-10 px-5 py-2">
        ????
      </div>
    </div>
  );
};

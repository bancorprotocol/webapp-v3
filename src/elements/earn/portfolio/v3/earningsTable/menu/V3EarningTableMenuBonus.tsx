import { memo } from 'react';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/V3EarningTableCellAction';

interface Props {
  setCurrentMenu: (menu: EarningTableMenuState) => void;
}

export const V3EarningTableMenuBonus = memo(({ setCurrentMenu }: Props) => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <button onClick={() => setCurrentMenu('main')} className="text-20">
          {'<-'}
        </button>
      </div>
      <div>Bonus menu ...</div>
      <div>placeholder content</div>
    </div>
  );
});

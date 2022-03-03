import { memo, ReactNode } from 'react';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';

interface Props {
  children: ReactNode;
  setCurrentMenu: (menu: EarningTableMenuState) => void;
}

export const V3EarningsTableSubMenuWrapper = memo(
  ({ children, setCurrentMenu }: Props) => {
    return (
      <div className="flex flex-col justify-between h-full">
        <div>
          <button onClick={() => setCurrentMenu('main')} className="text-20">
            {'<-'}
          </button>
        </div>
        <div>{children}</div>
      </div>
    );
  }
);

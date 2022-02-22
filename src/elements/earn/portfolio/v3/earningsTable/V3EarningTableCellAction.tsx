import { V3EarningTableMenu } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { V3EarningTableMenuMain } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuMain';
import { memo, useState } from 'react';
import { V3EarningTableMenuBonus } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuBonus';
import { V3EarningTableMenuRate } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuRate';

interface Props {
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
}
export type EarningTableMenuState = 'main' | 'bonus' | 'rate';

export const V3EarningTableCellAction = memo(
  ({ setIsWithdrawModalOpen }: Props) => {
    const [currentMenu, setCurrentMenu] =
      useState<EarningTableMenuState>('main');
    return (
      <V3EarningTableMenu>
        {currentMenu === 'main' && (
          <V3EarningTableMenuMain
            setCurrentMenu={setCurrentMenu}
            setIsWithdrawModalOpen={setIsWithdrawModalOpen}
          />
        )}
        {currentMenu === 'bonus' && (
          <V3EarningTableMenuBonus setCurrentMenu={setCurrentMenu} />
        )}
        {currentMenu === 'rate' && (
          <V3EarningTableMenuRate setCurrentMenu={setCurrentMenu} />
        )}
      </V3EarningTableMenu>
    );
  }
);

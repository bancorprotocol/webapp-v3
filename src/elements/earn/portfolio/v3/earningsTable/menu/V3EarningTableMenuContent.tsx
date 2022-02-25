import { memo, useState } from 'react';
import { V3EarningTableMenuMain } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuMain';
import { V3EarningTableMenuBonus } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuBonus';
import { V3EarningTableMenuRate } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuRate';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';

interface Props {
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
}

export const V3EarningsTableMenuContent = memo(
  ({ setIsWithdrawModalOpen }: Props) => {
    const [currentMenu, setCurrentMenu] =
      useState<EarningTableMenuState>('main');

    return (
      <>
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
      </>
    );
  }
);

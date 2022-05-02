import { memo, useState } from 'react';
import { V3EarningTableMenuMain } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuMain';
import { V3EarningTableMenuBonus } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuBonus';
import { V3EarningTableMenuRate } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuRate';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { Holding } from 'store/portfolio/v3Portfolio.types';

interface Props {
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
  setHoldingToWithdraw: (holding: Holding) => void;
  holding: Holding;
}

export const V3EarningsTableMenuContent = memo(
  ({ holding, setIsWithdrawModalOpen, setHoldingToWithdraw }: Props) => {
    const [currentMenu, setCurrentMenu] =
      useState<EarningTableMenuState>('main');

    return (
      <>
        {currentMenu === 'main' && (
          <V3EarningTableMenuMain
            holding={holding}
            setHoldingToWithdraw={setHoldingToWithdraw}
            setCurrentMenu={setCurrentMenu}
            setIsWithdrawModalOpen={setIsWithdrawModalOpen}
          />
        )}
        {currentMenu === 'bonus' && (
          <V3EarningTableMenuBonus setCurrentMenu={setCurrentMenu} />
        )}
        {currentMenu === 'rate' && (
          <V3EarningTableMenuRate
            holding={holding}
            setCurrentMenu={setCurrentMenu}
          />
        )}
      </>
    );
  }
);

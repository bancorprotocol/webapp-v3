import { memo, useState } from 'react';
import { V3EarningTableMenuMain } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuMain';
import { V3EarningTableMenuBonus } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuBonus';
import { V3EarningTableMenuRate } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuRate';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { Holding } from 'store/portfolio/v3Portfolio.types';

interface Props {
  handleDepositClick: () => void;
  holding: Holding;
  onStartJoin: Function;
  txJoinBusy: boolean;
}

export const V3EarningsTableMenuContent = memo(
  ({ holding, handleDepositClick, onStartJoin, txJoinBusy }: Props) => {
    const [currentMenu, setCurrentMenu] =
      useState<EarningTableMenuState>('main');

    return (
      <>
        {currentMenu === 'main' && (
          <V3EarningTableMenuMain
            holding={holding}
            setCurrentMenu={setCurrentMenu}
            handleDepositClick={handleDepositClick}
          />
        )}
        {currentMenu === 'bonus' && (
          <V3EarningTableMenuBonus setCurrentMenu={setCurrentMenu} />
        )}
        {currentMenu === 'rate' && (
          <V3EarningTableMenuRate
            holding={holding}
            setCurrentMenu={setCurrentMenu}
            onStartJoin={onStartJoin}
            txJoinBusy={txJoinBusy}
          />
        )}
      </>
    );
  }
);

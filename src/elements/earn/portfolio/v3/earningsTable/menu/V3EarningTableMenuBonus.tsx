import { memo } from 'react';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { V3EarningsTableSubMenuWrapper } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableSubMenuWrapper';

interface Props {
  setCurrentMenu: (menu: EarningTableMenuState) => void;
}

export const V3EarningTableMenuBonus = memo(({ setCurrentMenu }: Props) => {
  return (
    <V3EarningsTableSubMenuWrapper setCurrentMenu={setCurrentMenu}>
      <div>Bonus menu ...</div>
      <div>placeholder content</div>
    </V3EarningsTableSubMenuWrapper>
  );
});

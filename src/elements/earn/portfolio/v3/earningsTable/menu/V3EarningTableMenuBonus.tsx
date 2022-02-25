import { memo } from 'react';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { V3EarningsTableSubMenuWrapper } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableSubMenuWrapper';
import { prettifyNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

interface Props {
  setCurrentMenu: (menu: EarningTableMenuState) => void;
}

export const V3EarningTableMenuBonus = memo(({ setCurrentMenu }: Props) => {
  return (
    <V3EarningsTableSubMenuWrapper setCurrentMenu={setCurrentMenu}>
      <div className="text-secondary">Claim rewards</div>
      <div className="text-[28px] my-16">{prettifyNumber(123)} BNT</div>
      <div className="mt-10 mb-40">{prettifyNumber(123, true)}</div>
      <div className="grid grid-cols-2 gap-10">
        <Button
          variant={ButtonVariant.BLACK}
          size={ButtonSize.SMALL}
          textBadge={'86%'}
        >
          Claim & Earn
        </Button>
        <Button variant={ButtonVariant.SECONDARY} size={ButtonSize.SMALL}>
          Withdraw
        </Button>
      </div>
    </V3EarningsTableSubMenuWrapper>
  );
});

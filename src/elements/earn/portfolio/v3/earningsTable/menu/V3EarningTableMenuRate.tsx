import { memo } from 'react';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { V3EarningsTableSubMenuWrapper } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableSubMenuWrapper';
import { ProgressBar } from 'components/progressBar/ProgressBar';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { Holding } from 'store/portfolio/v3Portfolio.types';

interface Props {
  holding: Holding;
  setCurrentMenu: (menu: EarningTableMenuState) => void;
}

export const V3EarningTableMenuRate = memo(({ setCurrentMenu }: Props) => {
  return (
    <V3EarningsTableSubMenuWrapper setCurrentMenu={setCurrentMenu}>
      <div className="text-secondary">Annual earn rate</div>
      <div className="text-[28px] my-16">??%</div>

      <ProgressBar percentage={55} showPercentage />

      <button className="text-12 text-left my-10 flex">
        <span>Earn an additional annual interest ??%</span>
        <IconChevronRight className="w-16 ml-20" />
      </button>

      <hr className="border-silver dark:border-grey my-10" />

      <button className="text-12 text-secondary flex w-full text-left">
        <span className="flex-grow">Leave the bonus program</span>
        <IconChevronRight className="w-16 ml-20" />
      </button>
    </V3EarningsTableSubMenuWrapper>
  );
});

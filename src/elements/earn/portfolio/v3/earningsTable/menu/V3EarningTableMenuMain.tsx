import { memo } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';

interface Props {
  setCurrentMenu: (menu: EarningTableMenuState) => void;
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
}

export const V3EarningTableMenuMain = memo(
  ({ setCurrentMenu, setIsWithdrawModalOpen }: Props) => {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-20">
          <div className="flex space-x-20">
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full"
              textBadge="86%"
            >
              Deposit
            </Button>
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full"
            >
              Withdraw
            </Button>
          </div>
          <button
            onClick={() => setCurrentMenu('bonus')}
            className="flex justify-between w-full"
          >
            <span>Bonus gain</span>
            <span className="text-secondary flex items-center">
              {prettifyNumber(0.00123123123132)} BNT{' '}
              <IconChevronRight className="w-16 ml-5" />
            </span>
          </button>
          <button
            onClick={() => setCurrentMenu('rate')}
            className="flex justify-between w-full"
          >
            <span>Earning rate</span>
            <span className="text-secondary flex items-center">
              32 % <IconChevronRight className="w-16 ml-5" />
            </span>
          </button>
        </div>

        <hr className="border-silver" />

        <div className="flex flex-col items-start space-y-14 text-12 text-secondary">
          <button>Buy ETH with Fiat</button>
          <button>View Contract</button>
          <button>Display token on Metamask</button>
        </div>
      </div>
    );
  }
);

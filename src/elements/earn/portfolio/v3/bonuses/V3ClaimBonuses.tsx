import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { V3BonusesModal } from 'modals/V3BonusesModal';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  sendWithdrawBonusEvent,
  setCurrentWithdraw,
  WithdrawBonusEvent,
} from 'services/api/googleTagManager/withdraw';
import {
  getBlockchain,
  getBlockchainNetwork,
  getCurrency,
} from 'services/api/googleTagManager';
import { pool } from 'store/bancor/pool';

export const V3ClaimBonuses = () => {
  const { setBonusModalOpen, bonusUsdTotal, isLoading } = useV3Bonuses();

  return (
    <>
      <section className="content-block p-14">
        <div className="text-secondary text-12 hidden md:block mb-14">
          Claim Rewards
        </div>
        {isLoading ? (
          <div className="loading-skeleton h-30"></div>
        ) : bonusUsdTotal > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-[30px]">
              {prettifyNumber(bonusUsdTotal, true)}
            </span>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.ExtraSmall}
              onClick={() => {
                setCurrentWithdraw({
                  withdraw_pool: pool.name,
                  withdraw_blockchain: getBlockchain(),
                  withdraw_blockchain_network: getBlockchainNetwork(),
                  withdraw_token: pool.name,
                  withdraw_display_currency: getCurrency(),
                });
                sendWithdrawBonusEvent(WithdrawBonusEvent.CTAClick);
                setBonusModalOpen(true);
              }}
              disabled={bonusUsdTotal === 0}
            >
              Claim
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[30px] text-black-disabled dark:text-white-disabled">
            $0
          </div>
        )}
      </section>
      <V3BonusesModal />
    </>
  );
};

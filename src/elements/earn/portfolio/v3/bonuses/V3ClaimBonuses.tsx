import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { V3BonusesModal } from 'elements/earn/portfolio/v3/bonuses/V3BonusesModal';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { prettifyNumber } from 'utils/helperFunctions';

export const V3ClaimBonuses = () => {
  const { setBonusModalOpen, bonusUsdTotal, isLoading } = useV3Bonuses();

  return (
    <>
      <section className="content-block p-14">
        <div className="text-secondary text-12 hidden md:block mb-14">
          Claim Bonuses
        </div>
        {isLoading ? (
          <div className="loading-skeleton h-30"></div>
        ) : bonusUsdTotal > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-[30px]">
              {prettifyNumber(bonusUsdTotal, true)}
            </span>
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.EXTRASMALL}
              onClick={() => setBonusModalOpen(true)}
              className="px-40"
              disabled={bonusUsdTotal === 0}
            >
              Claim
            </Button>
          </div>
        ) : (
          <div className="text-12 text-primary text-center py-20">
            Nothing to claim
          </div>
        )}
      </section>
      <V3BonusesModal />
    </>
  );
};

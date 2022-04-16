import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { Image } from 'components/image/Image';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  GroupedStandardReward,
  StandardReward,
} from 'redux/portfolio/v3Portfolio';
import { shrinkToken } from 'utils/formulas';

const BonusGroupHead = ({ token }: { token: Token }) => {
  return (
    <>
      <div className="flex items-center">
        <Image
          src={token.logoURI}
          alt={'Token Logo'}
          className="w-20 h-20 rounded-full mr-10"
        />
        <span className="text-16">{token.symbol}</span>
        <span className="text-secondary ml-20">Holding Bonus</span>
      </div>
      <hr className="mb-20 mt-10 border-silver" />
    </>
  );
};

const BonusGroupItems = ({
  rewardsGroup,
  rewards,
}: {
  rewardsGroup: GroupedStandardReward;
  rewards: StandardReward[];
}) => {
  const { handleClaim, handleClaimAndEarn } = useV3Bonuses();

  return (
    <div className="space-y-20">
      {rewards.map((reward) => (
        <div key={reward.id} className="flex items-center justify-between">
          <TokenBalance
            symbol={rewardsGroup.groupToken.symbol}
            amount={shrinkToken(
              reward.pendingRewardsWei,
              rewardsGroup.groupToken.decimals
            )}
            usdPrice={rewardsGroup.groupToken.usdPrice}
            imgUrl={reward.programToken.logoURI}
          />
          <div className="flex space-x-20">
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.EXTRASMALL}
              onClick={() => handleClaim([reward.id])}
            >
              Claim
            </Button>
            <Button
              variant={ButtonVariant.DARK}
              size={ButtonSize.EXTRASMALL}
              onClick={() => handleClaimAndEarn([reward.id])}
              textBadge={'86%'}
              className="whitespace-nowrap"
            >
              Claim and Earn
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const V3BonusesModal = () => {
  const { bonuses, isBonusModalOpen, setBonusModalOpen, bonusUsdTotal } =
    useV3Bonuses();

  return (
    <ModalFullscreenV3
      title="Bonuses"
      isOpen={isBonusModalOpen}
      setIsOpen={setBonusModalOpen}
    >
      <div className="space-y-40 w-full max-w-[700px]">
        <div className="text-center">
          <div className="text-secondary text-12">Bonuses Total</div>
          <div className="text-[30px] mt-20">
            {prettifyNumber(bonusUsdTotal, true)}
          </div>
        </div>
        {bonuses.map((group) => (
          <div key={group.groupId}>
            <BonusGroupHead token={group.groupToken} />
            <BonusGroupItems rewardsGroup={group} rewards={group.rewards} />
          </div>
        ))}
      </div>
    </ModalFullscreenV3>
  );
};

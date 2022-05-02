import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { Image } from 'components/image/Image';
import { Button, ButtonVariant } from 'components/button/Button';
import { prettifyNumber } from 'utils/helperFunctions';
import { GroupedStandardReward } from 'store/portfolio/v3Portfolio';
import { shrinkToken } from 'utils/formulas';
import { Modal } from 'components/modal/Modal';
import { useState } from 'react';
import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';

const BonusGroupItems = ({
  rewardsGroup,
  setSelectedIds,
  selectedIds,
}: {
  rewardsGroup: GroupedStandardReward;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}) => {
  const addOrRemove = (id: string) => {
    const exists = selectedIds.includes(id);

    if (exists) {
      const ids = selectedIds.filter((idx) => idx !== id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-10 mt-20">
      {rewardsGroup.rewards.map((reward) => {
        const isSelected = selectedIds.includes(reward.id);
        return (
          <button
            key={reward.id}
            className={`${
              isSelected ? 'bg-white dark:bg-black' : ''
            } rounded py-10 px-20 w-full`}
            onClick={() => addOrRemove(reward.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`${
                    isSelected ? 'bg-primary' : 'bg-white dark:bg-black'
                  } rounded-full w-20 h-20 flex items-center justify-center`}
                >
                  {isSelected && <IconCheck className="w-10 text-white" />}
                </div>
                <Image
                  alt={'Token Logo'}
                  className="w-30 h-30 rounded-full mx-20"
                  src={reward.programPool.reserveToken.logoURI}
                />
                <div>{reward.programPool.reserveToken.symbol}</div>
              </div>
              <div>
                {prettifyNumber(
                  shrinkToken(
                    reward.pendingRewardsWei,
                    rewardsGroup.groupPool.decimals
                  )
                )}{' '}
                {rewardsGroup.groupPool.reserveToken.symbol}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const BonusGroup = ({
  rewardsGroup,
  showMore,
}: {
  rewardsGroup: GroupedStandardReward;
  showMore: boolean;
}) => {
  const { handleClaim, handleClaimAndEarn } = useV3Bonuses();
  const { groupPool } = rewardsGroup;
  const allTokens = rewardsGroup.rewards.map(
    (reward) => reward.programPool.reserveToken
  );
  const allIds: string[] = rewardsGroup.rewards.map((reward) => reward.id);
  const [selectedIds, setSelectedIds] = useState(allIds);

  const bntDisabled = selectedIds.length === 0;

  return (
    <div>
      <div className="p-10">
        <TokenBalanceLarge
          symbol={groupPool.reserveToken.symbol}
          amount={shrinkToken(
            rewardsGroup.totalPendingRewards,
            groupPool.decimals
          )}
          usdPrice={rewardsGroup.groupPool.reserveToken.usdPrice}
          logoURI={groupPool.reserveToken.logoURI}
        />

        {showMore ? (
          <div>
            <BonusGroupItems
              rewardsGroup={rewardsGroup}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </div>
        ) : (
          <div className="flex justify-between items-center mt-20">
            <div className="text-secondary">From {allTokens.length} Pools</div>
            <div>
              <TokensOverlap tokens={allTokens} />
            </div>
          </div>
        )}
      </div>
      <div className="flex space-x-10 mt-20">
        {showMore && (
          <Button
            variant={ButtonVariant.DARK}
            onClick={() => handleClaim(selectedIds)}
            className="w-full"
            disabled={bntDisabled}
          >
            Claim {groupPool.reserveToken.symbol} to wallet
          </Button>
        )}
        <Button
          variant={ButtonVariant.PRIMARY}
          onClick={() => handleClaimAndEarn(selectedIds)}
          className="w-full"
          disabled={bntDisabled}
        >
          Claim {groupPool.reserveToken.symbol} and Earn ??%
        </Button>
      </div>
    </div>
  );
};

export const V3BonusesModal = () => {
  const [showMore, setShowMore] = useState(false);
  const { bonuses, isBonusModalOpen, setBonusModalOpen, bonusUsdTotal } =
    useV3Bonuses();

  return (
    <Modal
      title="Bonuses"
      isOpen={isBonusModalOpen}
      setIsOpen={setBonusModalOpen}
      large
    >
      <div className="space-y-40 w-full max-w-[700px] p-10">
        <div className="text-center">
          <div className="text-secondary text-12">Bonuses Total</div>
          <div className="text-[30px] mt-20">
            {prettifyNumber(bonusUsdTotal, true)}
          </div>
          <button
            onClick={() => setShowMore((prev) => !prev)}
            className="text-primary mt-20"
          >
            {showMore ? 'Simple' : 'Advanced'}
          </button>
        </div>
        <div>
          {bonuses.map((group) => (
            <div key={group.groupId} className="bg-secondary p-10 rounded-30">
              <BonusGroup rewardsGroup={group} showMore={showMore} />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

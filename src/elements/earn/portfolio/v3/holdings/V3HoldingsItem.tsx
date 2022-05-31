import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useMemo } from 'react';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { V3HoldingsItemStaked } from 'elements/earn/portfolio/v3/holdings/V3HoldingsItemStaked';
import { V3HoldingsItemUnstaked } from 'elements/earn/portfolio/v3/holdings/V3HoldingsItemUnstaked';
import BigNumber from 'bignumber.js';
import { Image } from 'components/image/Image';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

export const V3HoldingsItem = ({
  holding,
  selectedId,
  setSelectedId,
}: {
  holding: Holding;
  selectedId: string;
  setSelectedId: (id: string) => void;
}) => {
  const { pool, programs } = holding;
  const { setBonusModalOpen } = useV3Bonuses();

  const rewardTokenAmountUsd = useMemo(
    () =>
      programs
        .reduce(
          (acc, program) =>
            acc.plus(
              shrinkToken(
                program.pendingRewardsWei,
                program.rewardsToken.decimals
              )
            ),
          new BigNumber(0)
        )
        .times(programs.length > 0 ? programs[0].rewardsToken.usdPrice : 0)
        .toNumber(),
    [programs]
  );

  const isOpen = holding.pool.poolDltId === selectedId;

  return (
    <div
      className={`content-block p-20 overflow-hidden ${
        isOpen ? '' : 'h-[80px]'
      }`}
    >
      <button
        onClick={() => setSelectedId(isOpen ? '' : holding.pool.poolDltId)}
        className="flex justify-between items-center w-full"
      >
        <div className="flex items-center space-x-10">
          <Image
            alt={'Token Logo'}
            className={'w-40 h-40 !rounded-full'}
            src={pool.reserveToken.logoURI}
          />
          <div className="flex items-center space-x-10">
            <div className="flex text-20 items-center space-x-10">
              <div className=" text-secondary">
                {holding.pool.reserveToken.symbol}
              </div>
              <div>{prettifyNumber(holding.combinedTokenBalance)}</div>
            </div>

            <div className="text-secondary">
              {prettifyNumber(
                toBigNumber(holding.pool.reserveToken.usdPrice).times(
                  holding.combinedTokenBalance
                ),
                true
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-30">
          <div>
            <div className="flex items-center space-x-10">
              <IconGift
                className={`w-16 text-primary ${
                  holding.hasLegacyStake ? 'text-warning' : 'text-primary'
                }`}
              />
              <div>{prettifyNumber(rewardTokenAmountUsd, true)}</div>
              <Button
                onClick={() => {
                  setBonusModalOpen(true);
                }}
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.EXTRASMALL}
              >
                Claim
              </Button>
            </div>
          </div>

          <IconChevronDown
            className={`w-16 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <hr className="border-1 mt-20 border-silver dark:border-grey -mx-20" />

      <div className="flex justify-between mt-20">
        <V3HoldingsItemUnstaked holding={holding} />
        <V3HoldingsItemStaked holding={holding} />
      </div>
    </div>
  );
};

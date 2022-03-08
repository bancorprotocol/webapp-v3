import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { BonusClaimable } from 'redux/portfolio/v3Portfolio';
import { Image } from 'components/image/Image';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';

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

const BonusGroupItems = ({ items }: { items: BonusClaimable[] }) => {
  const { handleClaim, handleClaimAndEarn } = useV3Bonuses();

  return (
    <div className="space-y-20">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between">
          <TokenBalance
            symbol={item.token.symbol}
            amount={item.amount}
            usdPrice={item.token.usdPrice || '0'}
            imgUrl={item.token.logoURI}
          />
          <div className="flex space-x-20">
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.EXTRASMALL}
              onClick={() => handleClaim(item.id)}
            >
              Claim
            </Button>
            <Button
              variant={ButtonVariant.DARK}
              size={ButtonSize.EXTRASMALL}
              onClick={() => handleClaimAndEarn(item.id)}
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
        {bonuses.map((bonus) => (
          <div>
            <BonusGroupHead key={bonus.id} token={bonus.token} />
            <BonusGroupItems items={bonus.claimable} />
          </div>
        ))}
      </div>
    </ModalFullscreenV3>
  );
};

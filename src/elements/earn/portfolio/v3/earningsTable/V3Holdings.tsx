import { useAppSelector } from 'store/index';
import { getPortfolioHoldings } from 'store/portfolio/v3Portfolio';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

const V3HoldingsItem = ({ holding }: { holding: Holding }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="content-block p-20">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex justify-between items-center w-full"
      >
        <TokenBalance
          symbol={holding.pool.reserveToken.symbol}
          amount={holding.combinedTokenBalance}
          usdPrice={holding.pool.reserveToken.usdPrice}
          imgUrl={holding.pool.reserveToken.logoURI}
        />
        <div>
          <IconChevronDown className="w-16" />
        </div>
      </button>

      {isOpen && (
        <>
          <hr className="border-1 mt-20 border-silver dark:border-grey -mx-20" />
          <div className="grid grid-cols-12 mt-30 text-center mb-10">
            <div className="col-span-3">
              <div className="text-secondary">Wallet Balance</div>
              <div className="mt-6 mb-10">14.14242323 ETH</div>
              <div className="flex justify-center">
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.EXTRASMALL}
                >
                  Deposit
                </Button>
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-secondary">Unstaked</div>
              <div className="mt-6 mb-10">11,111 ETH</div>
              <div className="flex justify-center">
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.EXTRASMALL}
                >
                  Stake
                </Button>
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-secondary">Staked</div>
              <div className="mt-6 mb-10">123,123 ETH</div>
              <div className="flex justify-center">
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.EXTRASMALL}
                >
                  Unstake
                </Button>
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-secondary">Bonus</div>
              <div className="mt-6 mb-10">14.14242323 BNT</div>
              <div className="flex justify-center">
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.EXTRASMALL}
                >
                  Claim
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const V3Holdings = () => {
  const holdings = useAppSelector(getPortfolioHoldings);
  // const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);

  return (
    <div className="space-y-10">
      {holdings.map((holding) => (
        <V3HoldingsItem key={holding.pool.poolDltId} holding={holding} />
      ))}
    </div>
  );
};

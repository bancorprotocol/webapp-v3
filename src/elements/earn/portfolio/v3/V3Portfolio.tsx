import { V3Withdraw } from 'elements/earn/portfolio/v3/pendingWithdraw/V3Withdraw';
import { V3AvailableToStake } from 'elements/earn/portfolio/v3/V3AvailableToStake';
import { getDarkMode } from 'store/user/user';
import { memo } from 'react';
import { useAppSelector } from 'store';
import { V3ClaimBonuses } from 'elements/earn/portfolio/v3/bonuses/V3ClaimBonuses';
import { WhatsNew } from './WhatsNew';
import { ReactComponent as HoldingsLight } from 'assets/holdingsLight.svg';
import { ReactComponent as HoldingsDark } from 'assets/holdingsDark.svg';
import { V3Holdings } from 'elements/earn/portfolio/v3/holdings/V3Holdings';
import { WalletConnectRequest } from 'elements/walletConnect/WalletConnectRequest';

const V3Portfolio = () => {
  const account = useAppSelector((state) => state.user.account);
  const darkMode = useAppSelector<boolean>(getDarkMode);
  const hasHoldings = true;

  return account ? (
    <div className="grid grid-cols-12 md:gap-40">
      <div className="col-span-12 md:col-span-6 xl:col-span-8 space-y-40">
        {hasHoldings ? (
          <>
            <div className="hidden md:flex items-center justify-center relative">
              <div className="absolute z-10 text-20 text-center">
                Personal Chart
                <div className="text-primary text-16">Coming Soon</div>
              </div>
              {darkMode ? (
                <HoldingsDark className="blur-[3px]" />
              ) : (
                <HoldingsLight className="blur-[3px]" />
              )}
            </div>
            <V3Holdings />
          </>
        ) : (
          <WhatsNew />
        )}
        <V3AvailableToStake />
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 space-y-40 mt-[44px] md:mt-0">
        <div>
          <h2 className="md:hidden max-w-[300px] rounded-20 h-[35px] mb-10">
            Claim Bonuses
          </h2>
          <V3ClaimBonuses />
        </div>

        <div>
          <h2 className="md:hidden max-w-[300px] rounded-20 h-[35px] mb-10">
            Pendings Withdrawals
          </h2>
          <V3Withdraw />
        </div>
      </div>
    </div>
  ) : (
    <WalletConnectRequest />
  );
};

export default memo(V3Portfolio);

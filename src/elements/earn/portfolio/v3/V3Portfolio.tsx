import { V3Withdraw } from 'elements/earn/portfolio/v3/pendingWithdraw/V3Withdraw';
import V3ExternalHoldings from 'elements/earn/portfolio/v3/externalHoldings/V3ExternalHoldings';
import { V3TotalHoldings } from 'elements/earn/portfolio/v3/V3TotalHoldings';
import { V3EarningTable } from 'elements/earn/portfolio/v3/earningsTable/V3EarningTable';
import { V3AvailableToStake } from 'elements/earn/portfolio/v3/V3AvailableToStake';
import { Button, ButtonSize } from 'components/button/Button';
import { useDispatch } from 'react-redux';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { openWalletModal } from 'store/user/user';
import { memo } from 'react';
import { useAppSelector } from 'store';
import { V3ClaimBonuses } from 'elements/earn/portfolio/v3/bonuses/V3ClaimBonuses';
import { WhatsNew } from './WhatsNew';

const V3Portfolio = () => {
  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();

  const handleLoginClick = () => {
    dispatch(openWalletModal(true));
  };
  const hasHoldings = true;

  return account ? (
    <div className="grid grid-cols-12 gap-40">
      <div className="col-span-12 md:col-span-6 xl:col-span-8 space-y-40">
        {hasHoldings ? (
          <>
            <V3TotalHoldings />
            <V3EarningTable />
          </>
        ) : (
          <WhatsNew />
        )}
        <V3AvailableToStake />
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 space-y-40">
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

        <V3ExternalHoldings />
      </div>
    </div>
  ) : (
    <div className="max-w-[320px] mx-auto">
      <h2 className="text-20 text-center font-medium">
        Connect your wallet to see your earnings and impermanent loss
      </h2>
      <div className="flex justify-center mt-20">
        <Button size={ButtonSize.SMALL} onClick={() => handleLoginClick()}>
          <IconWallet className="w-20 mr-10" />
          Connect Wallet
        </Button>
      </div>
    </div>
  );
};

export default memo(V3Portfolio);

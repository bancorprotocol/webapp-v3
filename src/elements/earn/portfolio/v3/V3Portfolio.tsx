import { V3Withdraw } from 'elements/earn/portfolio/v3/V3Withdraw';
import V3ExternalHoldings from 'elements/earn/portfolio/v3/externalHoldings/V3ExternalHoldings';
import { V3TotalHoldings } from 'elements/earn/portfolio/v3/V3TotalHoldings';
import { V3HoldingsStats } from 'elements/earn/portfolio/v3/V3HoldingsStats';
import { V3EarningTable } from 'elements/earn/portfolio/v3/V3EarningTable';
import { V3AvailableToStake } from 'elements/earn/portfolio/v3/V3AvailableToStake';
import { useWeb3React } from '@web3-react/core';
import { Button, ButtonSize } from 'components/button/Button';
import { useDispatch } from 'react-redux';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { openWalletModal } from 'redux/user/user';
import { memo } from 'react';

const V3Portfolio = () => {
  const { account } = useWeb3React();
  const dispatch = useDispatch();

  const handleLoginClick = () => {
    dispatch(openWalletModal(true));
  };

  return account ? (
    <div className="grid grid-cols-12 lg:gap-x-[36px]">
      <div className="col-span-12 lg:col-span-12 xl:col-span-8 space-y-20">
        <V3TotalHoldings />
        <V3HoldingsStats />
        <V3EarningTable />
        <V3AvailableToStake />
      </div>
      <div className="col-span-12 lg:col-span-12 xl:col-span-4 space-y-20">
        <V3Withdraw />
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

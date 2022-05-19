import { ReactComponent as GrowCoins } from 'assets/icons/growCoins.svg';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { Button } from 'components/button/Button';
import { DynamicText } from 'components/DynamicText/DynamicText';
import { MigrateProtect } from 'pages/earn/portfolio/MigrateProtect';
import { useWalletEmpty } from 'pages/earn/portfolio/usePortfolioRedirect';
import { openWalletModal } from 'store/user/user';
import { useDispatch } from 'react-redux';

export const PortfolioWelcome = () => {
  const walletIsEmpty = useWalletEmpty();

  return (
    <div className="pt-10 mx-20 mb-20 bg-white md:mb-0 md:mx-0 md:pt-0">
      {walletIsEmpty ? <GrowYour /> : <MigrateProtect />}
    </div>
  );
};

const GrowYour = () => {
  const dispatch = useDispatch();

  return (
    <div className="grid items-center h-screen md:grid-cols-2 justify-items-center">
      <div>
        <div className="flex mb-20 text-6xl">
          Grow Your
          <div className="ml-10 text-primary">
            <DynamicText texts={['ETH', 'BNT', 'DOT', 'SOL']} />
          </div>
        </div>
        <div className="text-20 text-graphite mb-[100px]">
          Earn up to 40% annually on your favorite tokens
        </div>
        <Button
          onClick={() => dispatch(openWalletModal(true))}
          className="mb-20"
        >
          Check our rates {'->'}
        </Button>

        <div className="text-graphite">
          <div className="flex items-center gap-10 mb-10">
            <IconCheck />
            Single Sided Staking
          </div>
          <div className="flex items-center gap-10">
            <IconCheck />
            100% Impermanent loss protection
          </div>
        </div>
      </div>

      <GrowCoins className="w-[400px] h-[500px]" />
    </div>
  );
};

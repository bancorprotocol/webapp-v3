import { ReactComponent as GrowCoins } from 'assets/icons/growCoins.svg';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { Button, ButtonVariant } from 'components/button/Button';
import { useDynamicText } from 'hooks/useDynamicText';
import { Rating } from 'components/rating/Rating';
import { MigrateProtect } from './MigrateProtect';

export const PortfolioWelcome = () => {
  const migrateProtect = true;
  return (
    <div className="bg-white mb-20 mx-20 pt-10 md:mb-0 md:mx-0 md:pt-0">
      {migrateProtect ? <MigrateProtect /> : <GrowYour />}
    </div>
  );
};

const GrowYour = () => {
  const text = useDynamicText(['ETH', 'BNT', 'DOT', 'SOL']);
  return (
    <div className="grid md:grid-cols-2 items-center justify-items-center h-screen">
      <div>
        <div className="flex text-6xl mb-20">
          Grow Your
          <div className="ml-10 text-primary">{text}</div>
        </div>
        <div className="text-20 text-graphite mb-[100px]">
          Earn up to 40% annually on your favorite tokens
        </div>
        <Button className="mb-20" variant={ButtonVariant.PRIMARY}>
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

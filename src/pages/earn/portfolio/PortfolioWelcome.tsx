import { ReactComponent as LogoPWelcome } from 'assets/portfolio/portfolioWelcome.svg';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { Button, ButtonVariant } from 'components/button/Button';
import { DynamicText } from 'components/dynamicText/DynamicText';
import { Rating } from 'components/rating/Rating';
import { MigrateProtect } from './MigrateProtect';

export const PortfolioWelcome = () => {
  const migrateProtect = true;
  return (
    <div className="max-w-[1140px] mx-auto">
      {migrateProtect ? <MigrateProtect /> : <GrowYour />}
    </div>
  );
};

const GrowYour = () => {
  return (
    <>
      <div className="grid grid-cols-2 items-center">
        <div>
          <div className="flex text-6xl mb-20">
            Grow Your
            <div className="ml-10 text-primary">
              <DynamicText texts={['ETH', 'BNT', 'DOT', 'SOL']} />
            </div>
          </div>
          <div className="text-20 text-graphite mb-[40px]">
            Earn up to 40% annually on your favorite tokens
          </div>
          <Button variant={ButtonVariant.PRIMARY}>Check our rates</Button>
        </div>
        <LogoPWelcome />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-graphite">
          <div className="flex items-center gap-4">
            <IconCheck />
            Deposit only a single token
          </div>
          <div className="flex items-center gap-4">
            <IconCheck />
            100% Impermanent loss protection
          </div>
        </div>
        <div>
          <Rating className="w-[80px] h-20" starCount={5} percentage={100} />
          <div className="text-graphite">Trusted by over 1M+ users</div>
        </div>
      </div>
    </>
  );
};

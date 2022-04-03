import { ReactComponent as LogoPWelcome } from 'assets/portfolio/portfolioWelcome.svg';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { ReactComponent as IconProtectedHeart } from 'assets/icons/protectedHeart.svg';
import { Rating } from 'components/rating/Rating';
import { Button, ButtonVariant } from 'components/button/Button';

export const MigrateProtect = () => {
  return (
    <div className="grid grid-cols-4 items-center h-[700px]">
      <div className="col-span-3">
        <div className="text-4xl w-[550px] mb-20">
          Would you like to earn 85% on your 25.45 ETH?
        </div>
        <div>See my other tokens {'->'}</div>
        <div className="flex items-center mt-[70px]">
          <Button className="w-[170px]">Yes</Button>
          <Button variant={ButtonVariant.SECONDARY}>No Thanks</Button>
        </div>
      </div>
      <div>
        <LogoPWelcome className="w-[240px] h-[300px]" />
        <div>
          <div className="flex items-center gap-4 mb-20">
            <IconProtectedHeart />
            Deposit only a single token
          </div>
          <div className="flex items-center gap-4">
            <IconProtected />
            100% Impermanent loss protection
          </div>
        </div>
        <div className="mt-40">
          <Rating className="w-[80px] h-20" starCount={5} percentage={100} />
          <div className="text-graphite">Trusted by over 1M+ users</div>
        </div>
      </div>
    </div>
  );
};

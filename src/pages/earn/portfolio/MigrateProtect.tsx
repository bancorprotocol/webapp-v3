import { ReactComponent as LogoPWelcome } from 'assets/portfolio/portfolioWelcome.svg';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { ReactComponent as IconProtectedHeart } from 'assets/icons/protectedHeart.svg';
import { Rating } from 'components/rating/Rating';
import { Button, ButtonVariant } from 'components/button/Button';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { useState } from 'react';
import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { prettifyNumber } from 'utils/helperFunctions';

export const MigrateProtect = () => {
  const migrate = true;

  return (
    <div className="grid grid-cols-4 items-center h-[700px]">
      {migrate ? <Migrate /> : <Protect />}
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

const Migrate = () => {
  const [seeAllHoldings, setSeeAllHoldings] = useState(false);

  const holdings = [
    {
      ammName: 'Some holding',
      tokens: [],
      usdValue: 100,
      rektStatus: '$1,000,000.00',
    },
    {
      ammName: 'Some other holding',
      tokens: [],
      usdValue: 200,
      rektStatus: 'At risk',
    },
  ];
  return (
    <div className="col-span-3">
      <div className="text-4xl w-[550px] mb-20">
        Migrate your holdings that are at risk of Impermanet loss?
      </div>
      {!seeAllHoldings && (
        <button
          className="text-black-low"
          onClick={() => setSeeAllHoldings(true)}
        >
          See my other holdings at risk {'->'}
        </button>
      )}
      <MigrateHoldingAtRisk
        className="mt-60"
        holdings={seeAllHoldings ? holdings : [holdings[0]]}
      />

      <div className="flex items-center mt-[70px]">
        <Button className="w-[170px]">Yes</Button>
        <Button variant={ButtonVariant.SECONDARY}>No Thanks</Button>
      </div>
    </div>
  );
};

const MigrateHoldingAtRisk = ({
  holdings,
  className,
}: {
  holdings: ExternalHolding[];
  className?: string;
}) => {
  return (
    <div className={className}>
      {holdings.map((holding) => {
        return (
          <div
            key={holding.ammName}
            className="flex items-center justify-between rounded-20 border border-silver p-20 h-[70px] w-[550px] mb-10"
          >
            <div>
              <div>{holding.ammName}</div>
              <div>{prettifyNumber(holding.usdValue, true)}</div>
            </div>

            <div className="mt-6">
              <div>Rekt Status</div>
              <div className="text-error">{holding.rektStatus}</div>
            </div>

            <div className={`h-30 w-[${20 * holding.tokens.length}px]`}>
              <TokensOverlap tokens={holding.tokens} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Protect = () => {
  return (
    <div className="col-span-3">
      <div className="text-4xl w-[550px] mb-20">
        Would you like to earn 85% on your 25.45 ETH?
      </div>
      <div>See my other tokens {'->'}</div>
      <div className="flex items-center mt-[70px]">
        <Button className="w-[170px]">Protect and earn 85%</Button>
        <Button variant={ButtonVariant.SECONDARY}>No Thanks</Button>
      </div>
    </div>
  );
};

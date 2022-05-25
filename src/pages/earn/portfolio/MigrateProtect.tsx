import { ReactComponent as GrowCoins } from 'assets/icons/growCoins.svg';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { ReactComponent as IconProtectedHeart } from 'assets/icons/protectedHeart.svg';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { Rating } from 'components/rating/Rating';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { useState } from 'react';
import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { prettifyNumber } from 'utils/helperFunctions';
import { Switch } from 'components/switch/Switch';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { getAvailableToStakeTokens } from 'store/bancor/token';
import { useAppSelector } from 'store';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { useExternalHoldings } from 'elements/earn/portfolio/v3/externalHoldings/useExternalHoldings';
import { ProtectedSettingsV3 } from 'components/protectedSettingsV3/ProtectedSettingsV3';

export const MigrateProtect = () => {
  const migrate = false;

  return (
    <div className="grid md:grid-cols-4 h-screen">
      <div className="col-span-3 md:w-[550px] mx-auto my-auto">
        {migrate ? <Migrate /> : <Protect />}
      </div>
      <div className="hidden md:grid bg-fog dark:bg-charcoal">
        <div className="w-[320px] mx-auto self-end">
          <GrowCoins className="h-[300px]" />
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
          <div className="my-40">
            <Rating
              className="w-[80px]"
              classStar="text-primary"
              percentage={100}
            />
            <div className="text-graphite mt-2">Trusted by over 1M+ users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Migrate = () => {
  const [seeAllHoldings, setSeeAllHoldings] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(-1);

  const { positions } = useExternalHoldings();

  return (
    <>
      {selectedHolding === -1 ? (
        <>
          <div className="text-4xl mb-20">
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
          {positions.length ? (
            <MigrateHoldingAtRisk
              className="mt-60 max-h-[400px] overflow-scroll"
              holdings={seeAllHoldings ? positions : [positions[0]]}
              onSelect={(index: number) => setSelectedHolding(index)}
            />
          ) : (
            <div className="loading-skeleton h-[100px] w-[550px] mt-60"></div>
          )}
          <div className="flex items-center mt-[70px] gap-10">
            <Button className="w-[170px]">Yes</Button>
            <Button variant={ButtonVariant.Secondary}>No Thanks</Button>
          </div>
        </>
      ) : (
        <>
          <button className="mt-40" onClick={() => setSelectedHolding(-1)}>
            {'<-'} Back
          </button>
          <div className="text-4xl mt-30">
            Secure this balancer holding from impermanent loss
          </div>
          <div className="text-16 text-black-low mt-10">
            You've lost $??,??? in impermanent loss so far, get 100% protected
            on bancor.
          </div>
          <div className="flex items-center text-black-low mt-40">
            Moving to protected earnings
            <IconInfo className="w-[15px] h-[15px] ml-5" />
          </div>
          <div className="rounded-20 bg-silver p-20 h-[120px] mt-10">
            <div className="flex items-center justify-between text-black-medium">
              Access full earnings
              <div className="flex items-center gap-10 text-black-low">
                additional gas ~$????.??
                <Switch selected={true} onChange={() => {}} />
              </div>
            </div>

            <div className="flex items-center justify-between align-bottom">
              <TokenBalance
                symbol={positions[selectedHolding].tokens[0].symbol}
                amount={positions[selectedHolding].tokens[0].balance!}
                usdPrice={positions[selectedHolding].tokens[0].usdPrice}
                imgUrl={positions[selectedHolding].tokens[0].logoURI}
              />
              <div className="flex items-center gap-10 text-primary">
                Earn ??%
              </div>
            </div>
          </div>
          <div className="flex items-center text-black-low mt-40">
            Exiting risky positions
            <IconInfo className="w-[15px] h-[15px] ml-5" />
          </div>
          <hr className="text-silver my-10" />
          {positions[selectedHolding].tokens
            .slice(1, positions[selectedHolding].tokens.length)
            .map((token) => (
              <div className="flex items-center justify-between">
                <TokenBalance
                  symbol={token.symbol}
                  amount={token.balance!}
                  usdPrice={token.usdPrice}
                  imgUrl={token.logoURI}
                />
                <div className="text-black-low">HODL in your wallet</div>
              </div>
            ))}

          <Button size={ButtonSize.Full} className="md:w-[160px] mt-50">
            Confirm
          </Button>
          <ProtectedSettingsV3 />
        </>
      )}
    </>
  );
};

const MigrateHoldingAtRisk = ({
  holdings,
  className,
  onSelect,
}: {
  holdings: ExternalHolding[];
  onSelect: (index: number) => void;
  className?: string;
}) => {
  return (
    <div className={className}>
      {holdings.map((holding, index) => {
        return (
          <button
            key={holding.tokens[0].address}
            onClick={() => onSelect(index)}
            className="flex items-center justify-between rounded-20 border border-silver p-20 h-[70px] w-full mb-10"
          >
            <div>
              <div>{holding.ammName}</div>
              <div>{prettifyNumber(holding.usdValue, true)}</div>
            </div>

            <div className="mt-6">
              <div>Rekt Status</div>
              <div className="text-error">{holding.rektStatus}</div>
            </div>

            <div className={`h-30 w-[${30 * holding.tokens.length}px]`}>
              <TokensOverlap tokens={holding.tokens} />
            </div>
          </button>
        );
      })}
    </div>
  );
};

const Protect = () => {
  const [seeAll, setSeeAll] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(-1);
  const [input, setInput] = useState('');

  const availabelToStake = useAppSelector(getAvailableToStakeTokens);
  const topStake = availabelToStake[0];

  return (
    <>
      {selectedPosition === -1 ? (
        <>
          {seeAll ? (
            <>
              <button className="mt-40" onClick={() => setSeeAll(false)}>
                {'<-'} Back
              </button>
              <div className="text-4xl mt-30">Earn interest on your tokens</div>
              <div className="text-16 text-black-low mt-10 mb-100">
                $??,??? balance
              </div>
              <div className="max-h-[400px] overflow-scroll">
                {availabelToStake.map((stake, index) => {
                  return (
                    <button
                      key={stake.token.address}
                      onClick={() => setSelectedPosition(index)}
                      className="flex items-center justify-between rounded-20 border border-silver p-20 h-[70px] mt-10 w-full"
                    >
                      <TokenBalance
                        symbol={stake.token.symbol}
                        amount={stake.token.balance!}
                        usdPrice={stake.token.usdPrice}
                        imgUrl={stake.token.logoURI}
                      />
                      <div className="flex items-center gap-10 text-primary">
                        Earn {prettifyNumber(stake.pool.apr.total)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {topStake ? (
                <div className="text-4xl mb-20 text-silver">
                  Would you like to earn{' '}
                  {prettifyNumber(topStake.pool.apr.total)}% on your{' '}
                  {prettifyNumber(topStake.token.balance!)}{' '}
                  {topStake.token.symbol}?
                </div>
              ) : (
                <div className="loading-skeleton h-[100px] w-[550px] mb-20"></div>
              )}
              <button onClick={() => setSeeAll(true)}>
                See my other tokens {'->'}
              </button>
              <div className="flex items-center mt-[70px] gap-10">
                <Button
                  onClick={() => setSelectedPosition(0)}
                  className="w-[170px]"
                >
                  Yes
                </Button>
                <Button variant={ButtonVariant.Secondary}>No Thanks</Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <button className="mt-40" onClick={() => setSelectedPosition(-1)}>
            {'<-'} Back
          </button>
          <div className="text-4xl mt-30">
            {`How much of your ${prettifyNumber(
              availabelToStake[selectedPosition].token.balance!
            )} ${
              availabelToStake[selectedPosition].token.symbol
            } do you want to desposit?`}
          </div>
          <div className="text-16 text-black-low mt-10">$??,??? balance</div>
          <TokenInputV3
            token={availabelToStake[selectedPosition].token}
            inputTkn={input}
            setInputTkn={setInput}
            inputFiat={''}
            setInputFiat={() => {}}
            isFiat={false}
            isError={false}
          />
          <div className="rounded-20 bg-silver p-20 h-[80px] mt-20">
            <div className="flex items-center justify-between text-black-medium">
              <div>
                Access full earnings
                <div className="text-black-low">additional gas ~$????.??</div>
              </div>
              <div className="flex items-center gap-10">
                ??%
                <Switch selected={true} onChange={() => {}} />
              </div>
            </div>
          </div>
          <Button className="mt-30 w-[160px]">Deposit</Button>

          <ProtectedSettingsV3 />
        </>
      )}
    </>
  );
};

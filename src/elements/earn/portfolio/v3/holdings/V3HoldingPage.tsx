import { useNavigation } from 'hooks/useNavigation';
import { useParams } from 'react-router-dom';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { Image } from 'components/image/Image';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import { useAppSelector } from 'store';
import {
  getPortfolioHoldings,
  getIsLoadingHoldings,
} from 'store/portfolio/v3Portfolio';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { prettifyNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

export const V3HoldingPage = () => {
  const { id } = useParams();
  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);
  const holding = holdings.find((x) => x.pool.poolDltId === id);

  const { goToPage } = useNavigation();
  const token = holding?.pool.reserveToken;
  const deficitAmount = 5;

  return (
    <div className="pt-100 mx-auto max-w-[1140px]">
      <button
        className="flex items-center gap-10 text-secondary"
        onClick={() => goToPage.portfolio()}
      >
        <IconChevronRight className="w-16 rotate-180" />
        Portfolio
      </button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[70px] mt-[48px]">
        {isLoadingHoldings || !holding || !token ? (
          'Loading'
        ) : (
          <>
            <div className="col-span-2">
              <div className="flex items-center">
                <Image
                  alt={'Token Logo'}
                  className="w-64 h-64 !rounded-full mr-10"
                  src={token.logoURI}
                />
                <div className="text-secondary">
                  Total Holdings
                  <div className="flex items-center gap-16 text-[36px] mt-5 text-black dark:text-white">
                    {prettifyNumber(holding.combinedTokenBalance)}
                    {deficitAmount && (
                      <PopoverV3
                        buttonElement={() => (
                          <IconWarning className="text-error w-24 h-24" />
                        )}
                      >
                        <span className="text-secondary">
                          Due to vault deficit, current value is{' '}
                          {prettifyNumber(deficitAmount)} {token.symbol}
                        </span>
                      </PopoverV3>
                    )}
                  </div>
                </div>
              </div>
              <hr className="my-48 border-silver dark:border-grey" />
              <div className="flex justify-between text-secondary">
                <div>
                  Total Invested
                  <div className="text-black dark:text-white mt-8">1622.2</div>
                </div>
                <div>
                  Compunding returns
                  <div className="text-black dark:text-white mt-8">1622.2</div>
                  <div className="text-primary mt-8">50%</div>
                </div>
                <div>
                  Vault balance
                  <div className="text-primary mt-8">1622.2</div>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-30 shadow p-30 rounded-10">
                {token.symbol} Pool APR
                <div>
                  <div className="text-[36px] mt-10">
                    {holding.pool.apr7d.total.toFixed(2)}%
                  </div>
                  <hr className="my-30 border-silver dark:border-grey" />
                  <div className="flex items-center justify-between">
                    <div>
                      Available to Deposit
                      <div className="text-black dark:text-white mt-8">
                        1622.2
                      </div>
                    </div>
                    <Button
                      size={ButtonSize.ExtraSmall}
                      variant={ButtonVariant.Secondary}
                    >
                      Deposit
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-30 shadow rounded-10">
                <div>
                  bn{token.symbol} Available
                  <div className="text-black dark:text-white mt-8">1622.2</div>
                </div>
                <Button
                  size={ButtonSize.ExtraSmall}
                  variant={ButtonVariant.Secondary}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

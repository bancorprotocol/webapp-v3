import { useNavigation } from 'hooks/useNavigation';
import { useParams } from 'react-router-dom';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { TokenBalanceLarge } from 'components/tokenBalance/TokenBalanceLarge';
import { useAppSelector } from 'store';
import {
  getPortfolioHoldings,
  getIsLoadingHoldings,
} from 'store/portfolio/v3Portfolio';

export const V3HoldingPage = () => {
  const { id } = useParams();
  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);
  const holding = holdings.find((x) => x.pool.poolDltId === id);

  const { goToPage } = useNavigation();

  return (
    <div className="pt-100 mx-100">
      <button
        className="flex items-center gap-10 text-secondary"
        onClick={() => goToPage.portfolio()}
      >
        <IconChevronRight className="w-16 rotate-180" />
        Portfolio
      </button>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-[48px]">
        {isLoadingHoldings || !holding ? (
          'Loading'
        ) : (
          <TokenBalanceLarge
            symbol={holding.pool.reserveToken.symbol}
            amount={holding.combinedTokenBalance}
            usdPrice={holding.pool.reserveToken.usdPrice!}
            logoURI={holding.pool.reserveToken.logoURI}
          />
        )}
      </div>
    </div>
  );
};

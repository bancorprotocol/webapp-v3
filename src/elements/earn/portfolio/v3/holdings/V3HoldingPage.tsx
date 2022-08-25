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
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useState } from 'react';
import { bntToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import useAsyncEffect from 'use-async-effect';
import { expandToken, shrinkToken } from 'utils/formulas';
import { DepositV3Modal } from 'elements/earn/pools/poolsTable/v3/DepositV3Modal';
import V3WithdrawModal from '../initWithdraw/V3WithdrawModal';
import BigNumber from 'bignumber.js';

export const V3HoldingPage = () => {
  const { id } = useParams();
  const { goToPage } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);
  const holding = holdings.find((x) => x.pool.poolDltId === id);

  const token = holding?.pool.reserveToken;
  const isBNT = holding?.pool.poolDltId === bntToken;

  const isDisabled = toBigNumber(holding ? holding.tokenBalance : 0).isZero();

  const [withdrawAmounts, setWithdrawAmounts] = useState<{
    tkn: number;
    bnt: number;
    totalAmount: string;
    baseTokenAmount: string;
    bntAmount: string;
  }>();

  useAsyncEffect(async () => {
    if (!holding) return;

    const poolTokenBalance =
      await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
        holding.pool.poolDltId,
        expandToken(holding.combinedTokenBalance, holding.pool.decimals)
      );
    const res = await fetchWithdrawalRequestOutputBreakdown(
      holding.pool.poolDltId,
      poolTokenBalance.toString(),
      expandToken(holding.combinedTokenBalance, holding.pool.decimals)
    );
    setWithdrawAmounts(res);
  }, [
    holding?.pool.poolDltId,
    holding?.combinedTokenBalance,
    holding?.pool.decimals,
  ]);

  const deficitAmount =
    holding && !isBNT && withdrawAmounts
      ? shrinkToken(withdrawAmounts.baseTokenAmount ?? 0, holding.pool.decimals)
      : undefined;

  const vaultBalance = holding
    ? toBigNumber(holding.pool.liquidity.usd)
        .div(holding.pool.stakedBalance.usd)
        .minus(1)
        .times(100)
    : new BigNumber(0);

  return (
    <div className="pt-100 mx-auto max-w-[1140px] p-20">
      <button
        className="flex items-center gap-10 text-secondary"
        onClick={() => goToPage.portfolio()}
      >
        <IconChevronRight className="w-16 rotate-180" />
        Portfolio
      </button>
      <div className="grid md:grid-cols-3 gap-[70px] mt-[48px]">
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
              <div className="grid md:grid-cols-3 text-secondary">
                <div>
                  Total Invested
                  <div className="text-black dark:text-white mt-8">
                    {holding.stakedTokenBalance}
                  </div>
                </div>
                <div>
                  Compunding returns
                  <div className="text-black dark:text-white mt-8">????.??</div>
                  <div className="text-primary mt-8">???%</div>
                </div>
                <div>
                  Vault balance
                  <div className="text-primary mt-8">
                    {' '}
                    <span
                      className={`${
                        vaultBalance.gte(0) ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {vaultBalance.gte(0) ? '+' : ''}
                      {vaultBalance.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="mb-30 shadow p-30 rounded-10">
                {token.symbol} Pool APR
                <div>
                  <div className="text-[36px] mt-10">
                    {holding.pool.apr7d.total.toFixed(2)}%
                  </div>
                  <hr className="my-30 border-silver dark:border-grey" />
                  <div className="flex items-center justify-between">
                    <div className="text-secondary">
                      Available to Deposit
                      <div className="text-black dark:text-white mt-8">
                        {prettifyNumber(token.balance ?? 0)}
                      </div>
                    </div>
                    <DepositV3Modal
                      pool={holding.pool}
                      renderButton={(onClick) => (
                        <Button
                          onClick={() => onClick()}
                          size={ButtonSize.ExtraSmall}
                          variant={ButtonVariant.Secondary}
                        >
                          Deposit
                        </Button>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-30 shadow rounded-10">
                <div className="text-secondary">
                  bn{token.symbol} Available
                  <div className="text-black text-20 dark:text-white mt-8">
                    {prettifyNumber(holding.poolTokenBalance)}
                  </div>
                </div>
                <>
                  <V3WithdrawModal
                    holding={holding}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                  />
                  <Button
                    size={ButtonSize.ExtraSmall}
                    variant={ButtonVariant.Secondary}
                    onClick={() => setIsOpen(true)}
                    disabled={isDisabled}
                  >
                    Withdraw
                  </Button>
                </>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

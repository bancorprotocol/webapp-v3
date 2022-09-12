import { useNavigation } from 'hooks/useNavigation';
import { useParams } from 'react-router-dom';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import { Image } from 'components/image/Image';
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
import { getTokenById } from 'store/bancor/bancor';
import { getV3byID } from 'store/bancor/pool';
import { WalletConnectRequest } from 'elements/walletConnect/WalletConnectRequest';
import { V3ManageProgramsModal } from './V3ManageProgramsModal';

export const V3HoldingPage = () => {
  const { id } = useParams();
  const { goToPage } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);

  const account = useAppSelector((state) => state.user.account);
  const holdings = useAppSelector(getPortfolioHoldings);
  const isLoadingHoldings = useAppSelector(getIsLoadingHoldings);
  const holding = holdings.find((x) => x.pool.poolDltId === id);
  const token = useAppSelector((state) => getTokenById(state, id || ''));
  const pool = useAppSelector((state) => getV3byID(state, id || ''));

  const isBNT = holding?.pool.poolDltId === bntToken;
  const isDisabled = toBigNumber(holding ? holding.tokenBalance : 0).isZero();
  const programs = holding?.programs.filter((p) =>
    toBigNumber(p.tokenAmountWei).gt(0)
  );
  const showRewards =
    programs?.length !== 0 || holding?.pool.latestProgram?.isActive;

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

  const totalPTAllPrograms =
    holding?.programs
      .map((program) =>
        Number(shrinkToken(program.poolTokenAmountWei, holding?.pool.decimals))
      )
      .reduce((sum, current) => sum + current, 0) ?? 0;

  const deficitAmount =
    holding && !isBNT && withdrawAmounts
      ? shrinkToken(withdrawAmounts.baseTokenAmount ?? 0, holding.pool.decimals)
      : undefined;

  const vaultBalance = holding
    ? toBigNumber(holding.pool.poolDeficit)
    : new BigNumber(0);

  if (!token && !isLoadingHoldings) {
    goToPage.notFound();
    return null;
  }

  return (
    <div className="py-100 w-full mx-auto max-w-[1140px] p-20">
      <button
        className="flex items-center gap-10 text-secondary"
        onClick={() => goToPage.portfolio()}
      >
        <IconChevronRight className="w-16 rotate-180" />
        Portfolio
      </button>
      <div className="grid md:grid-cols-3 gap-[70px] mt-[48px]">
        <div className="md:col-span-2">
          <div className="flex items-center">
            {token ? (
              <Image
                alt={'Token Logo'}
                className="w-64 h-64 !rounded-full mr-10"
                src={token.logoURI}
              />
            ) : (
              <div className="loading-skeleton !rounded-full w-64 h-64" />
            )}
            <div>
              <div className="text-secondary mb-10">Total Holdings</div>
              {holding ? (
                <div className="flex items-center gap-16 text-[36px] text-black dark:text-white">
                  {prettifyNumber(holding.combinedTokenBalance)}
                  {deficitAmount && (
                    <PopoverV3
                      buttonElement={() => (
                        <IconWarning className="text-error w-24 h-24" />
                      )}
                    >
                      <span className="text-secondary">
                        Due to vault deficit, current value is{' '}
                        {prettifyNumber(deficitAmount)}{' '}
                        {holding.pool.reserveToken.symbol}
                      </span>
                    </PopoverV3>
                  )}
                </div>
              ) : account && isLoadingHoldings ? (
                <div className="loading-skeleton !rounded-full w-[140px] h-20" />
              ) : (
                <></>
              )}
            </div>
          </div>
          <hr className="my-48 border-silver dark:border-grey" />
          {holding ? (
            <div className="grid md:grid-cols-3 gap-20 text-secondary">
              <div className="md:block grid grid-cols-2">
                Total Invested
                <div className="text-black dark:text-white md:mt-8 justify-self-end">
                  Coming Soon
                </div>
              </div>
              <div className="md:block grid grid-cols-2">
                Compunding returns
                <div className="md:block flex flex-col items-end justify-self-end">
                  <div className="text-black dark:text-white md:mt-8">
                    Coming Soon
                  </div>

                  {false && <div className="text-primary mt-8">???%</div>}
                </div>
              </div>
              <div className="md:block grid grid-cols-2">
                Vault balance
                <div className="md:mt-8 justify-self-end">
                  {isBNT ? (
                    <span className="text-secondary">(never in deficit)</span>
                  ) : (
                    <span
                      className={`${
                        vaultBalance.gte(0) ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {vaultBalance.gte(0) ? '+' : ''}
                      {vaultBalance.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : account && isLoadingHoldings ? (
            <div className="loading-skeleton w-full h-32" />
          ) : (
            <></>
          )}
        </div>
        <div>
          <div className="mb-30 p-30 shadow dark:bg-charcoal rounded-10">
            {token ? (
              `${token.symbol} Pool APR`
            ) : (
              <div className="loading-skeleton w-80 h-20" />
            )}
            <div>
              {pool ? (
                <div className="text-[36px] mt-10">
                  {pool.apr7d.total.toFixed(2)}%
                </div>
              ) : (
                <div className="loading-skeleton w-[200px] h-20 mt-10" />
              )}
              {!account || (token && Number(token.balance) < 0) ? (
                <></>
              ) : token && pool ? (
                <>
                  <hr className="my-30 border-silver dark:border-grey" />
                  <div className="flex items-center justify-between">
                    <div className="text-secondary">
                      Available to Deposit
                      <div className="text-black dark:text-white mt-8">
                        {prettifyNumber(token.balance ?? 0)}
                      </div>
                    </div>
                    <DepositV3Modal
                      pool={pool}
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
                </>
              ) : (
                <div className="loading-skeleton w-full h-32" />
              )}
            </div>
          </div>
          {holding ? (
            <div className="shadow dark:bg-charcoal rounded-10 p-30">
              {showRewards && (
                <>
                  <div className="flex items-center justify-between mb-10 md:mb-0">
                    <div className="text-secondary">
                      <div className="max-w-[145px]">
                        bn{holding.pool.reserveToken.symbol} Available in
                        rewards program
                      </div>
                      <div className="text-black text-20 dark:text-white mt-8">
                        {prettifyNumber(totalPTAllPrograms)}
                      </div>
                    </div>
                    <V3ManageProgramsModal
                      holding={holding}
                      renderButton={(onClick) => (
                        <Button
                          size={ButtonSize.ExtraSmall}
                          variant={ButtonVariant.Secondary}
                          onClick={() => onClick()}
                        >
                          Manage
                        </Button>
                      )}
                    />
                  </div>
                  <hr className="hidden md:block my-30 border-silver dark:border-grey" />
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="text-secondary">
                  bn{holding.pool.reserveToken.symbol} Available
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
          ) : !account || !isLoadingHoldings ? (
            <></>
          ) : (
            <div className="loading-skeleton w-full h-32" />
          )}
        </div>
        {!account && (
          <div className="md:col-span-3">
            <WalletConnectRequest />
          </div>
        )}
      </div>
    </div>
  );
};

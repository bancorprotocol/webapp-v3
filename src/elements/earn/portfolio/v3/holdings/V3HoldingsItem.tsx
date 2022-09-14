import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useMemo, useState } from 'react';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { expandToken, shrinkToken } from 'utils/formulas';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import BigNumber from 'bignumber.js';
import { PopoverV3 } from 'components/popover/PopoverV3';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { bntToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { useNavigation } from 'hooks/useNavigation';

export const V3HoldingsItem = ({ holding }: { holding: Holding }) => {
  const { pool, programs } = holding;
  const { goToPage } = useNavigation();

  const rewardTokenAmountUsd = useMemo(
    () =>
      programs
        .reduce(
          (acc, program) =>
            acc.plus(
              shrinkToken(
                program.pendingRewardsWei,
                program.rewardsToken.decimals
              )
            ),
          new BigNumber(0)
        )
        .times(programs.length > 0 ? programs[0].rewardsToken.usdPrice : 0)
        .toNumber(),
    [programs]
  );

  const isBNT = holding.pool.poolDltId === bntToken;

  const [withdrawAmounts, setWithdrawAmounts] = useState<{
    tkn: number;
    bnt: number;
    totalAmount: string;
    baseTokenAmount: string;
    bntAmount: string;
  }>();

  useAsyncEffect(async () => {
    const poolTokenBalance =
      await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
        pool.poolDltId,
        expandToken(holding.combinedTokenBalance, holding.pool.decimals)
      );
    const res = await fetchWithdrawalRequestOutputBreakdown(
      holding.pool.poolDltId,
      poolTokenBalance.toString(),
      expandToken(holding.combinedTokenBalance, holding.pool.decimals)
    );
    setWithdrawAmounts(res);
  }, [
    holding.pool.poolDltId,
    holding.combinedTokenBalance,
    holding.pool.decimals,
  ]);

  return (
    <div className="content-block p-20 overflow-hidden">
      <button
        onClick={() => goToPage.portfolioHolding(holding.pool.poolDltId)}
        className="flex items-center justify-between w-full"
      >
        <div>
          <PopoverV3
            buttonElement={() => (
              <TokenBalance
                symbol={pool.reserveToken.symbol}
                amount={holding.combinedTokenBalance}
                usdPrice={pool.reserveToken.usdPrice!}
                imgUrl={pool.reserveToken.logoURI}
                deficitAmount={
                  !isBNT && withdrawAmounts
                    ? shrinkToken(
                        withdrawAmounts.baseTokenAmount ?? 0,
                        holding.pool.decimals
                      )
                    : undefined
                }
              />
            )}
          >
            {holding.combinedTokenBalance} {holding.pool.reserveToken.symbol}
          </PopoverV3>
        </div>
        <div className="flex items-center space-x-30">
          {toBigNumber(rewardTokenAmountUsd).gt(0) && (
            <div className="flex items-center space-x-10">
              <IconGift
                className={`w-16 text-primary ${
                  holding.hasLegacyStake ? 'text-warning' : 'text-primary'
                }`}
              />
              <div>+{prettifyNumber(rewardTokenAmountUsd, true)}</div>
            </div>
          )}

          <IconChevronRight className="w-16" />
        </div>
      </button>
    </div>
  );
};

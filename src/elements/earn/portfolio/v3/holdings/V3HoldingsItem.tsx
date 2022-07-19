import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useMemo, useState } from 'react';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { expandToken, shrinkToken } from 'utils/formulas';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { V3HoldingsItemStaked } from 'elements/earn/portfolio/v3/holdings/V3HoldingsItemStaked';
import { V3HoldingsItemUnstaked } from 'elements/earn/portfolio/v3/holdings/V3HoldingsItemUnstaked';
import BigNumber from 'bignumber.js';
import { Image } from 'components/image/Image';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { bntToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const V3HoldingsItem = ({
  holding,
  selectedId,
  setSelectedId,
}: {
  holding: Holding;
  selectedId: string;
  setSelectedId: (id: string) => void;
}) => {
  const { pool, programs } = holding;

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

  const isOpen = holding.pool.poolDltId === selectedId;

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
    <div
      className={`content-block p-20 overflow-hidden ${
        isOpen ? '' : 'h-[80px]'
      }`}
    >
      <button
        onClick={() => setSelectedId(isOpen ? '' : holding.pool.poolDltId)}
        className="flex justify-between items-center w-full"
      >
        <div className="flex items-center space-x-10">
          <Image
            alt={'Token Logo'}
            className={'w-40 h-40 !rounded-full'}
            src={pool.reserveToken.logoURI}
          />
          <PopoverV3
            buttonElement={() => (
              <div className="flex items-center space-x-10">
                <div className="flex text-20 items-center space-x-10">
                  <div className=" text-secondary">
                    {holding.pool.reserveToken.symbol}
                  </div>
                  <div>{prettifyNumber(holding.combinedTokenBalance)}</div>
                </div>

                <div className="text-secondary">
                  {prettifyNumber(
                    toBigNumber(holding.pool.reserveToken.usdPrice).times(
                      holding.combinedTokenBalance
                    ),
                    true
                  )}
                </div>
              </div>
            )}
          >
            {holding.combinedTokenBalance} {holding.pool.reserveToken.symbol}
          </PopoverV3>
          {!isBNT && withdrawAmounts && (
            <PopoverV3
              buttonElement={() => <IconWarning className="text-error z-50" />}
            >
              <span className="text-secondary">
                Due to vault deficit, current value is{' '}
                {prettifyNumber(
                  shrinkToken(
                    withdrawAmounts.baseTokenAmount ?? 0,
                    holding.pool.decimals
                  )
                )}{' '}
                {holding.pool.reserveToken.symbol}
              </span>
            </PopoverV3>
          )}
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

          <IconChevronDown
            className={`w-16 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <hr className="border-1 mt-20 border-silver dark:border-grey -mx-20" />

      <div className="flex justify-between mt-20 flex-col md:flex-row md:space-x-30 space-y-30 md:space-y-0">
        <V3HoldingsItemUnstaked holding={holding} />
        <V3HoldingsItemStaked holding={holding} />
      </div>
    </div>
  );
};

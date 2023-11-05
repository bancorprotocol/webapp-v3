import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';

export interface VoteBalancesProps {
  govToken: Token | undefined;
  account: string | null | undefined;
  stakeAmount: string | undefined;
}

export const VoteBalances: React.FC<VoteBalancesProps> = ({
  govToken,
  account,
  stakeAmount,
}) => {
  return (
    <div className="flex flex-col lg:w-[220px] lt-lg:h-[145px] lg:ml-20 border border-silver dark:border-grey rounded-10 pl-20 pr-20">
      <div className="flex flex-col justify-evenly items-center flex-1">
        <div className="text-secondary">Available Balance</div>
        {!account || (govToken && govToken.balance) ? (
          <div className="text-20 dark:text-white">
            {govToken && govToken.balance
              ? `${prettifyNumber(govToken.balance)} ${govToken.symbol}`
              : '--'}
          </div>
        ) : (
          <div className="loading-skeleton h-[24px] w-[140px]" />
        )}
      </div>
      <hr className="border-silver dark:border-grey" />
      <div className="flex flex-col justify-evenly items-center flex-1">
        <div className="text-secondary">Staked Balance</div>
        {!account || stakeAmount ? (
          <div className="text-20 dark:text-white">
            {stakeAmount && govToken
              ? `${prettifyNumber(stakeAmount)} ${govToken.symbol}`
              : '--'}
          </div>
        ) : (
          <div className="loading-skeleton h-[24px] w-[140px] mb-4" />
        )}
      </div>
    </div>
  );
};

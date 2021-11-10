import { ReactComponent as IconInfo } from 'assets/icons/info.svg';

interface WithdrawLiquidityInfoProps {
  protectionNotReached: boolean;
  multiplierWillReset: boolean;
}

export const WithdrawLiquidityInfo = ({
  protectionNotReached,
  multiplierWillReset,
}: WithdrawLiquidityInfoProps) => {
  return (
    <>
      {(protectionNotReached || multiplierWillReset) && (
        <div className="border border-warning rounded bg-warning bg-opacity-[5%] dark:bg-blue-2 dark:bg-opacity-100 p-20 text-12">
          <div className="text-warning flex items-center">
            <IconInfo className="w-10 mr-10" />
            <span className="font-semibold">Important!</span>
          </div>
          <div className="text-grey-4 dark:text-grey-3 ml-20 mt-5">
            {protectionNotReached && (
              <p>
                You still haven’t reached full protection. There is a risk for
                impermanent loss and you might receive less than your original
                stake amount as a result.
              </p>
            )}
            {multiplierWillReset && (
              <p>
                Withdrawing will reset your rewards multiplier for all active
                positions back to x1
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

import { ReactComponent as IconInfo } from 'assets/icons/info.svg';

export const RewardsClaimInfo = () => {
  return (
    <div className="border border-warning rounded bg-warning bg-opacity-[5%] dark:bg-blue-2 dark:bg-opacity-100 p-20 text-12">
      <div className="text-warning flex items-center">
        <IconInfo className="w-10 mr-10" />
        <span className="font-semibold">Important!</span>
      </div>
      <p className="text-grey-4 dark:text-grey-3 ml-20 mt-5">
        Withdrawing rewards will reset your rewards multiplier for all active
        positions back to x1 and reduce the future rewards you are able to
        receive. In order to claim and stake your rewards without resetting your
        current multipliers, click the “Stake my rewards” button below.
      </p>
    </div>
  );
};

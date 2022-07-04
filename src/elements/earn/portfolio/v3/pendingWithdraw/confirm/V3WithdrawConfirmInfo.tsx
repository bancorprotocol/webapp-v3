import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';

interface Props {
  handleCancelClick: () => void;
}
export const V3WithdrawConfirmInfo = ({ handleCancelClick }: Props) => {
  return (
    <div className="p-20 space-y-20 rounded bg-secondary">
      <h3 className="text-20">Cancel withdrawal and earn more!</h3>
      <div className="flex space-x-10">
        <div>
          <IconCheck className="w-18 h-18" />
        </div>
        <div>
          <h4 className="font-semibold text-14">Claim cooldown rewards</h4>
          <p className="text-secondary">
            Your tokens kept earning fees and auto-compounding rewards during
            the cooldown period. If you cancel the withdrawal, you will keep
            those earnings.
          </p>
        </div>
      </div>

      <button
        onClick={handleCancelClick}
        className="font-semibold text-primary text-16"
      >
        Cancel withdrawal and earn {'->'}
      </button>
    </div>
  );
};

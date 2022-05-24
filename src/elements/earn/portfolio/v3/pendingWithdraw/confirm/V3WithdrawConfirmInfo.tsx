import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';

interface Props {
  handleCancelClick: () => void;
}
export const V3WithdrawConfirmInfo = ({ handleCancelClick }: Props) => {
  return (
    <div className="bg-secondary p-20 rounded space-y-20">
      <h3 className="text-20">Cancel withdrawal and earn more!</h3>

      <div className="flex space-x-10">
        <div>
          <IconCheck className="w-18 h-18" />
        </div>
        <div>
          <h4 className="text-14 font-semibold">Claim cooldown rewards</h4>
          <p className="text-secondary">
            Your tokens kept earning during the cooldown period. If you don’t
            withdraw them, you will keep those earnings.
          </p>
        </div>
      </div>
      <div className="flex space-x-10">
        <div>
          <IconCheck className="w-18 h-18" />
        </div>
        <div>
          <h4 className="text-14 font-semibold">Keep Earning</h4>
          <p className="text-secondary">
            Your tokens will continue earning auto-compounding income.
          </p>
        </div>
      </div>
      <div className="flex space-x-10">
        <div>
          <IconCheck className="w-18 h-18" />
        </div>
        <div>
          <h4 className="text-14 font-semibold">
            No Matter What You’re Protected
          </h4>
          <p className="text-secondary">
            Your tokens were never exposed to Impermanent Loss during the
            cooldown period. Whether or not you withdraw, you’re always fully
            protected.
          </p>
        </div>
      </div>

      <button
        onClick={handleCancelClick}
        className="text-primary text-16 font-semibold"
      >
        Cancel withdrawal and earn {'->'}
      </button>
    </div>
  );
};

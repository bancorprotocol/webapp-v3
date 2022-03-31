import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';

interface Props {
  withdrawRequest: WithdrawalRequest;
  handleCancelClick: () => void;
}
export const V3WithdrawConfirmInfo = ({
  withdrawRequest,
  handleCancelClick,
}: Props) => {
  return (
    <div className="bg-fog p-20 rounded space-y-20">
      <h3 className="text-20">Cancel withdrawal and earn more!</h3>

      <div className="flex space-x-10">
        <div>
          <IconCheck className="text-green-500 w-18 h-18" />
        </div>
        <div>
          <h4 className="text-14 font-semibold">Claim cooldown rewards</h4>
          <p>
            Your tokens kept growing at a ??% rate after cooldown, if you don’t
            withdraw you will keep those earnings.
          </p>
        </div>
      </div>
      <div className="flex space-x-10">
        <div>
          <IconCheck className="text-green-500 w-18 h-18" />
        </div>
        <div>
          <h4 className="text-14 font-semibold">Earn 24%</h4>
          <p>
            Keep your {withdrawRequest.token.symbol} earning from trading fees
            and rewards. Thats over $???? earnings Auto-compounding for 5 years*
          </p>
        </div>
      </div>
      <div className="flex space-x-10">
        <div>
          <IconCheck className="text-green-500 w-18 h-18" />
        </div>
        <div>
          <h4 className="text-14 font-semibold">Stay 100% protected</h4>
          <p>
            From the first seconed you will earn with full protection and no
            risk from Impermanent loss
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

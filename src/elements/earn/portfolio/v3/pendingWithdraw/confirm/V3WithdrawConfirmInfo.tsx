import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { ReactComponent as IconEarn } from 'assets/icons/earn.svg';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

interface Props {
  handleCancelClick: () => void;
}
export const V3WithdrawConfirmInfo = ({ handleCancelClick }: Props) => {
  return (
    <div className="p-20 space-y-20 rounded bg-secondary">
      <h3 className="text-20">Cancel withdrawal</h3>

      <div className="flex items-center gap-10 mb-20">
        <IconProtected className="w-15 h-15" />
        Stay in Bancor until BNT distribution is reenabled.
      </div>
      <div className="flex gap-10">
        <IconEarn className="w-15 h-15" />
        Keep earning auto-compounding income on your deposited tokens.
      </div>

      <Button
        className="mt-50"
        onClick={handleCancelClick}
        size={ButtonSize.Meduim}
        variant={ButtonVariant.Secondary}
      >
        Cancel withdrawal
      </Button>
    </div>
  );
};

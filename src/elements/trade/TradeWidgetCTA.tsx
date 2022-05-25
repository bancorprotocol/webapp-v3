import { toBigNumber } from 'utils/helperFunctions';
import { Button } from 'components/button/Button';
import { useTokenInputV3Return } from 'elements/trade/useTknFiatInput';

interface Props {
  handleCTAClick: () => void;
  fromInput?: useTokenInputV3Return;
  toInput?: useTokenInputV3Return;
  isBusy: boolean;
  errorInsufficientBalance?: string;
}

export const TradeWidgetCTA = ({
  handleCTAClick,
  toInput,
  fromInput,
  isBusy,
  errorInsufficientBalance,
}: Props) => {
  return (
    <Button
      className="w-full mt-10"
      onClick={handleCTAClick}
      disabled={
        !fromInput ||
        !toInput ||
        !toBigNumber(fromInput?.inputTkn ?? 0).gt(0) ||
        isBusy ||
        !!errorInsufficientBalance
      }
    >
      {!toBigNumber(fromInput?.inputTkn ?? 0).gt(0) ? 'Enter Amount' : 'Trade'}
    </Button>
  );
};

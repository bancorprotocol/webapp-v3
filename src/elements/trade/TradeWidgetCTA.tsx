import { toBigNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useTokenInputV3Return } from 'elements/trade/useTknFiatInput';
import { ethToken, wethToken } from 'services/web3/config';
import BigNumber from 'bignumber.js';
import { useAppSelector } from 'store/index';
import { useMemo } from 'react';

interface Props {
  handleCTAClick: () => void;
  fromInput?: useTokenInputV3Return;
  toInput?: useTokenInputV3Return;
  isBusy: boolean;
  errorInsufficientBalance?: string;
  priceImpact: string;
  isLoading: boolean;
}

export const TradeWidgetCTA = ({
  handleCTAClick,
  toInput,
  fromInput,
  isBusy,
  errorInsufficientBalance,
  priceImpact,
  isLoading,
}: Props) => {
  const account = useAppSelector((state) => state.user.account);

  const usingWeth =
    (toInput?.token.address === wethToken &&
      fromInput?.token.address !== ethToken) ||
    (fromInput?.token.address === wethToken &&
      toInput?.token.address !== ethToken);

  const swapButtonText = () => {
    if (!toInput || !fromInput) return 'Select a token';
    if (usingWeth) return 'Please change WETH to ETH';
    if (fromInput.token.balance) {
      const isInsufficientBalance = new BigNumber(fromInput.token.balance).lt(
        fromInput.inputTkn
      );
      if (isInsufficientBalance) return 'Insufficient balance';
    }
    const isInputZero =
      fromInput.inputTkn === '' || new BigNumber(fromInput.inputTkn).eq(0);
    if (isInputZero) return 'Enter Amount';
    if (!toInput?.inputTkn) return 'Insufficient liquidity';
    if (!account) return 'Connect your wallet';
    const isHighSlippage = new BigNumber(priceImpact).gte(5);
    if (isHighSlippage) return 'Trade with high price impact';
    return 'Trade';
  };

  const buttonVariant = () => {
    const isHighSlippage = new BigNumber(priceImpact).gte(10);
    if (isHighSlippage || !account) return ButtonVariant.Secondary;
    return ButtonVariant.Primary;
  };

  const isSwapDisabled = useMemo(() => {
    return (
      !fromInput ||
      !toInput ||
      !toInput?.inputTkn ||
      usingWeth ||
      !toBigNumber(fromInput?.inputTkn ?? 0).gt(0) ||
      isBusy ||
      !!errorInsufficientBalance ||
      isLoading ||
      fromInput?.isTyping
    );
  }, [
    errorInsufficientBalance,
    fromInput,
    isBusy,
    isLoading,
    toInput,
    usingWeth,
  ]);

  return (
    <Button
      variant={buttonVariant()}
      className="mt-15 disabled:bg-silver dark:disabled:bg-charcoal"
      onClick={handleCTAClick}
      disabled={isSwapDisabled}
      size={ButtonSize.Full}
    >
      {isLoading || fromInput?.isTyping ? (
        <div>please wait</div>
      ) : (
        swapButtonText()
      )}
    </Button>
  );
};

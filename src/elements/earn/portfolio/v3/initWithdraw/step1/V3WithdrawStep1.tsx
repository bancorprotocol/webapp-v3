import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { memo, useCallback, useMemo, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useV3WithdrawStep1 } from 'elements/earn/portfolio/v3/initWithdraw/step1/useV3WithdrawStep1';
import { CirclePercentage } from 'components/circlePercentage/CirclePercentage';
import { ReactComponent as IconLightning } from 'assets/icons/lightning.svg';
import { V3WithdrawStep1Breakdown } from 'elements/earn/portfolio/v3/initWithdraw/step1/V3WithdrawStep1Breakdown';
import { useV3WithdrawStep3 } from 'elements/earn/portfolio/v3/initWithdraw/step3/useV3WithdrawStep3';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import BigNumber from 'bignumber.js';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { Switch } from 'components/switch/Switch';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import { shrinkToken } from 'utils/formulas';
import useAsyncEffect from 'use-async-effect';
import { debounce } from 'lodash';
import { bntToken } from 'services/web3/config';
import {
  getBlockchain,
  getBlockchainNetwork,
  getFiat,
  getCurrency,
} from 'services/api/googleTagManager';
import {
  setCurrentWithdraw,
  sendWithdrawEvent,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';

interface Props {
  inputTkn: string;
  setInputTkn: (amount: string) => void;
  inputFiat: string;
  setInputFiat: (amount: string) => void;
  setStep: (step: number) => void;
  holding: Holding;
  isFiat: boolean;
  withdrawalFeeInPercent: string;
  withdrawalFeeInTkn: string;
  amount: AmountTknFiat;
  setRequestId: (val: string) => void;
  lockDurationInDays: number;
}

const V3WithdrawStep1 = ({
  holding,
  setStep,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  isFiat,
  amount,
  setRequestId,
}: Props) => {
  const {
    token,
    setBalance,
    isInputError,
    percentageUnstaked,
    showBreakdown,
    withdrawAmounts,
    fetchWithdrawAmounts,
    isLoadingWithdrawAmounts,
    setIsLoadingWithdrawAmounts,
  } = useV3WithdrawStep1({
    holding,
    setStep,
    inputTkn,
    setInputTkn,
    setInputFiat,
  });

  const skipStep2 = useMemo(
    () => new BigNumber(inputTkn).lte(holding.tokenBalance),
    [inputTkn, holding.tokenBalance]
  );

  const handleNextStep = () => {
    const portion = new BigNumber(inputTkn)
      .div(holding.tokenBalance)
      .times(100)
      .toFixed(0);
    const withdraw_portion =
      portion === '25' ||
      portion === '50' ||
      portion === '75' ||
      portion === '100'
        ? portion
        : '(no value)';
    setCurrentWithdraw({
      withdraw_pool: holding.pool.name,
      withdraw_blockchain: getBlockchain(),
      withdraw_blockchain_network: getBlockchainNetwork(),
      withdraw_input_type: getFiat(isFiat),
      withdraw_token: holding.pool.name,
      withdraw_token_amount: inputTkn,
      withdraw_token_amount_usd: inputFiat,
      withdraw_portion,
      withdraw_display_currency: getCurrency(),
    });
    sendWithdrawEvent(WithdrawEvent.WithdrawAmountContinue);
    if (skipStep2) {
      void handleButtonClick();
    } else {
      setStep(2);
    }
  };

  const [isConfirmed, setIsConfirmed] = useState(false);

  const { handleButtonClick, txBusy } = useV3WithdrawStep3({
    holding,
    amount,
    setStep,
    setRequestId,
  });

  const [withdrawAmountsInput, setWithdrawAmountsInput] = useState<
    | {
        tkn: number;
        bnt: number;
        totalAmount: string;
        baseTokenAmount: string;
        bntAmount: string;
      }
    | undefined
  >(undefined);

  const onInputChange = useCallback(() => {
    debounce(async () => {
      if (Number(inputTkn) > Number(holding.tokenBalance))
        setWithdrawAmountsInput(undefined);
      else {
        const res = await fetchWithdrawAmounts(inputTkn);
        setWithdrawAmountsInput(res);
      }
      setIsLoadingWithdrawAmounts(false);
    }, 300)();
  }, [
    fetchWithdrawAmounts,
    inputTkn,
    setIsLoadingWithdrawAmounts,
    holding.tokenBalance,
  ]);

  useAsyncEffect(async () => {
    const input = Number(inputTkn);
    if (input > 0) {
      setIsLoadingWithdrawAmounts(true);
      onInputChange();
    }
  }, [inputTkn]);

  const isBNT = token.address === bntToken;

  return (
    <div className="w-full max-w-[460px]">
      <h1 className="text-[36px] font-normal mb-30 leading-10">
        How much {token.symbol} do you want to withdraw?
      </h1>

      <div className="flex items-center gap-10 mb-5">
        <button
          onClick={() => setBalance(100)}
          className={`flex items-center ${
            isInputError ? 'text-error' : 'text-secondary'
          }`}
        >
          {showBreakdown && (
            <div className="relative flex items-center justify-center mr-10">
              <IconLightning className="absolute w-6 text-primary" />
              <CirclePercentage
                percentage={percentageUnstaked}
                className="w-24 h-24"
              />
            </div>
          )}
          Available {prettifyNumber(holding.tokenBalance)} {token.symbol}
        </button>
        {!isBNT && withdrawAmounts && (
          <PopoverV3
            buttonElement={() => <IconWarning className="text-error" />}
          >
            <span className="text-secondary">
              {isLoadingWithdrawAmounts ? (
                '...'
              ) : (
                <>
                  Due to vault deficit, current value is{' '}
                  {prettifyNumber(
                    shrinkToken(
                      withdrawAmounts.baseTokenAmount.toString() || '0',
                      holding.pool.decimals
                    )
                  )}{' '}
                  {token.symbol}
                </>
              )}
            </span>
          </PopoverV3>
        )}
      </div>

      <TokenInputV3
        token={token}
        inputTkn={inputTkn}
        setInputTkn={setInputTkn}
        inputFiat={inputFiat}
        setInputFiat={setInputFiat}
        isFiat={isFiat}
        isError={isInputError}
      />

      <div className="flex justify-between w-full px-20 pt-5 mb-20">
        <div className="space-x-10 opacity-50">
          <button onClick={() => setBalance(25)}>25%</button>
          <button onClick={() => setBalance(50)}>50%</button>
          <button onClick={() => setBalance(75)}>75%</button>
          <button onClick={() => setBalance(100)}>100%</button>
        </div>
        {showBreakdown && (
          <V3WithdrawStep1Breakdown
            holding={holding}
            percentageUnstaked={percentageUnstaked}
          />
        )}
      </div>
      {Number(inputTkn) > 0 &&
        !isBNT &&
        withdrawAmounts &&
        withdrawAmountsInput &&
        Number(inputTkn) <= Number(holding.tokenBalance) && (
          <span className="text-secondary">
            Due to vault deficit, current value is{' '}
            {isLoadingWithdrawAmounts ? (
              '...'
            ) : (
              <>
                {prettifyNumber(
                  shrinkToken(
                    withdrawAmountsInput.baseTokenAmount || 0,
                    holding.pool.decimals
                  )
                )}{' '}
                {token.symbol}
              </>
            )}
          </span>
        )}

      <div className="flex flex-col items-center justify-center my-20">
        {!isBNT && (
          <div className="flex gap-10 p-20 text-start text-error bg-error bg-opacity-10 rounded-20">
            <Switch
              selected={isConfirmed}
              onChange={() => setIsConfirmed(!isConfirmed)}
            />
            <div>
              <div className="text-error-hover">
                BNT distribution is currently disabled.
              </div>
              <div>
                I understand I may be withdrawing at a loss if the{' '}
                {token.symbol} vault is in deficit.
              </div>
            </div>
          </div>
        )}

        <Button
          className="mt-20"
          size={ButtonSize.Full}
          onClick={handleNextStep}
          variant={ButtonVariant.Secondary}
          disabled={
            (!isConfirmed && !isBNT) || !inputTkn || isInputError || txBusy
          }
        >
          {txBusy
            ? 'waiting for confirmation ...'
            : skipStep2
            ? `${
                isFiat ? `${prettifyNumber(amount.tkn)} ${token.symbol} - ` : ''
              }Start cooldown and move to withdraw`
            : `Start cooldown and move to withdraw`}
        </Button>
      </div>

      <div className="space-y-10 opacity-50">
        <div>USD value is subject to change at time of withdrawal. </div>
        <div>Withdrawal fee set to 0%. Cooldown set to 0 days. </div>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep1);

import { Button } from 'components/button/Button';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { memo, useMemo, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useV3WithdrawStep1 } from 'elements/earn/portfolio/v3/initWithdraw/step1/useV3WithdrawStep1';
import { CirclePercentage } from 'components/circlePercentage/CirclePercentage';
import { ReactComponent as IconLightning } from 'assets/icons/lightning.svg';
import { V3WithdrawStep1Breakdown } from 'elements/earn/portfolio/v3/initWithdraw/step1/V3WithdrawStep1Breakdown';
import { useV3WithdrawStep3 } from 'elements/earn/portfolio/v3/initWithdraw/step3/useV3WithdrawStep3';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import BigNumber from 'bignumber.js';
import {
  setCurrentWithdraw,
  sendWithdrawEvent,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { EmergencyInfo } from 'components/EmergencyInfo';
import { Switch } from 'components/switch/Switch';
import {
  getBlockchain,
  getBlockchainNetwork,
  getCurrency,
  getFiat,
} from 'services/api/googleTagManager';

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
  withdrawalFeeInPercent,
  withdrawalFeeInTkn,
  amount,
  setRequestId,
  lockDurationInDays,
}: Props) => {
  const { token, setBalance, isInputError, percentageUnstaked, showBreakdown } =
    useV3WithdrawStep1({
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
        : 'N/A';
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
    sendWithdrawEvent(WithdrawEvent.WithdrawPoolClick);
    if (skipStep2) {
      void handleButtonClick();
    } else {
      setStep(2);
    }
  };

  const [isConfirmed, setIsConfirmed] = useState(false);

  const { handleButtonClick, ModalApprove, txBusy } = useV3WithdrawStep3({
    holding,
    amount,
    setStep,
    setRequestId,
  });

  return (
    <div className="text-center">
      {ModalApprove}
      <h1 className="text-[36px] font-normal mb-50 leading-10">
        How much {token.symbol} do you want to withdraw?
      </h1>

      <div className="w-full p-20 mb-20 bg-fog dark:bg-black rounded-20">
        <div className="flex flex-col items-center justify-between font-bold text-18 mb-15 text-error">
          <div>Withdrawals involve a {lockDurationInDays}-day cool-down.</div>
          <div>
            Please note that the IL protection mechanism is temporarily paused.
          </div>
          <PopoverV3
            children={<EmergencyInfo />}
            hover
            buttonElement={() => (
              <span className="underline cursor-pointer">More info</span>
            )}
          />
        </div>
      </div>

      <button
        onClick={() => setBalance(100)}
        className={`flex items-center mx-auto mb-5 ${
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

      <TokenInputV3
        token={token}
        inputTkn={inputTkn}
        setInputTkn={setInputTkn}
        inputFiat={inputFiat}
        setInputFiat={setInputFiat}
        isFiat={isFiat}
        isError={isInputError}
      />
      <div className="flex justify-between w-full px-20 pt-5">
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

      <div className="flex flex-col items-center justify-center my-40">
        <div className="flex items-center gap-10 mx-10">
          I understand that the withdrawal amount does not include any
          impermanent loss compensation
          <Switch
            selected={isConfirmed}
            onChange={() => setIsConfirmed(!isConfirmed)}
          />
        </div>
        <Button
          className="mt-20 px-50"
          onClick={handleNextStep}
          disabled={!isConfirmed || !inputTkn || isInputError || txBusy}
        >
          {txBusy
            ? 'waiting for confirmation ...'
            : skipStep2
            ? `${
                isFiat ? `${prettifyNumber(amount.tkn)} ${token.symbol} - ` : ''
              }Start cooldown`
            : `Next ${'->'}`}
        </Button>
      </div>

      <div className="space-y-10 opacity-50">
        <p>USD value will likely change during the cooldown period</p>
        <span>Withdrawal fee {withdrawalFeeInPercent}%</span>
        {Number(withdrawalFeeInTkn) > 0 && (
          <>
            <span className="px-10">-</span>
            <span>
              {prettifyNumber(withdrawalFeeInTkn)} {token.symbol}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep1);

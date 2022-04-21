import { Button } from 'components/button/Button';
import { memo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import { ResetApproval } from 'components/resetApproval/ResetApproval';
import { useV3WithdrawStep3 } from 'elements/earn/portfolio/v3/initWithdraw/step3/useV3WithdrawStep3';

interface Props {
  amount: AmountTknFiat;
  lockDurationInDays: number;
  holding: Holding;
  setStep: (step: number) => void;
}

const V3WithdrawStep3 = ({
  amount,
  lockDurationInDays,
  holding,
  setStep,
}: Props) => {
  const { token, onStart, ModalApprove, approveTokens, txBusy } =
    useV3WithdrawStep3({
      holding,
      amount,
      setStep,
    });

  return (
    <>
      <div className="text-center">
        <h1 className="text-[36px] font-normal my-50">
          Start {lockDurationInDays.toFixed(4)} day cooldown of{' '}
          <span className="text-primary">
            {prettifyNumber(amount.tkn)} {token.symbol}
          </span>
        </h1>
        <div className="flex justify-center">
          <Button className="px-50" onClick={() => onStart()} disabled={txBusy}>
            {txBusy ? 'waiting for confirmation ...' : 'Start cooldown'}
          </Button>
        </div>
        <div className="flex justify-center space-x-20 mt-20">
          {approveTokens.map((t) => (
            <ResetApproval
              key={t.token.address}
              spenderContract={ContractsApi.BancorNetwork.contractAddress}
              tokenContract={t.token.address}
              tokenSymbol={t.token.symbol}
            />
          ))}
        </div>
      </div>
      {ModalApprove}
    </>
  );
};

export default memo(V3WithdrawStep3);

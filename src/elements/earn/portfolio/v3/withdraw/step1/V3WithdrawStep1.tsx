import { Button } from 'components/button/Button';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { memo } from 'react';
import { Token } from 'services/observables/tokens';

interface Props {
  token: Token;
  amount: string;
  setAmount: (amount: string) => void;
  setStep: (step: number) => void;
  availableBalance: string;
  isFiat: boolean;
}

const V3WithdrawStep1 = ({
  token,
  setStep,
  amount,
  setAmount,
  isFiat,
  availableBalance,
}: Props) => {
  return (
    <div className="text-center">
      <h1 className="text-[36px] font-normal mb-50">
        How much ETH do you want to withdraw?
      </h1>

      <button
        onClick={() => setAmount(availableBalance)}
        className="font-normal opacity-50"
      >
        Available {availableBalance} ETH
      </button>

      <TokenInputV3
        symbol={token.symbol}
        amount={amount}
        setAmount={setAmount}
        usdPrice={token.usdPrice ? token.usdPrice : '1'}
        isFiat={isFiat}
        logoURI={token.logoURI}
      />

      <div className="space-x-10 opacity-50">
        <button>25%</button>
        <button>50%</button>
        <button>75%</button>
        <button>100%</button>
      </div>

      <div className="flex justify-center">
        <Button
          className="px-50 my-40"
          onClick={() => setStep(2)}
          disabled={!amount}
        >
          Next {'->'}
        </Button>
      </div>

      <div className="opacity-50 space-y-10">
        <p>USD value will likely change during the cooldown period</p>
        <p>Coverage cost 0.25% - 0.0025 ETH</p>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep1);

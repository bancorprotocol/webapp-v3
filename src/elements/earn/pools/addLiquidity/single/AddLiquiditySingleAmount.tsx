import { Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Pool } from 'services/observables/pools';

interface Props {
  pool: Pool;
  token: Token;
  setToken: Function;
  amount: string;
  setAmount: Function;
  amountUsd: string;
  setAmountUsd: Function;
  errorMsg: string;
  setErrorMsg: Function;
  isBNTSelected: boolean;
}
export const AddLiquiditySingleAmount = ({
  pool,
  token,
  setToken,
  amount,
  setAmount,
  amountUsd,
  setAmountUsd,
  errorMsg,
  setErrorMsg,
  isBNTSelected,
}: Props) => {
  useEffect(() => {
    if (new BigNumber(amount).gt(token.balance || 0)) {
      setErrorMsg('Insufficient Balance');
    } else {
      setErrorMsg('');
    }
  }, [amount, token.balance, setErrorMsg, isBNTSelected]);

  return (
    <>
      <TokenInputField
        setInput={setAmount}
        selectable={true}
        border
        includedTokens={pool.reserves.map((x) => x.address)}
        input={amount}
        label="Stake Amount"
        token={token}
        disabled={isBNTSelected}
        amountUsd={amountUsd}
        setAmountUsd={setAmountUsd}
        setToken={(token: Token) => setToken(token)}
      />
      {errorMsg && <div className="mt-5 pl-[140px] text-error">{errorMsg}</div>}
    </>
  );
};

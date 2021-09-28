import { Pool, Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useState } from 'react';

interface Props {
  pool: Pool;
  token: Token;
  setToken: Function;
  amount: string;
  setAmount: Function;
}
export const AddLiquiditySingleAmount = ({
  pool,
  token,
  setToken,
  amount,
  setAmount,
}: Props) => {
  const [amountUsd, setAmountUsd] = useState('');

  return (
    <TokenInputField
      setInput={setAmount}
      selectable={true}
      border
      includedTokens={pool.reserves.map((x) => x.address)}
      input={amount}
      label="Stake Amount"
      token={token}
      amountUsd={amountUsd}
      setAmountUsd={setAmountUsd}
      setToken={(token: Token) => setToken(token)}
    />
  );
};

import { Pool, Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';

interface Props {
  pool: Pool;
  token: Token;
  setToken: Function;
  amount: string;
  setAmount: Function;
  amountUsd: string;
  setAmountUsd: Function;
}
export const AddLiquiditySingleAmount = ({
  pool,
  token,
  setToken,
  amount,
  setAmount,
  amountUsd,
  setAmountUsd,
}: Props) => {
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

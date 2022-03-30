import { Button } from 'components/button/Button';
import { memo, useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import { ResetApproval } from 'components/resetApproval/ResetApproval';

interface Props {
  amount: AmountTknFiat;
  lockDurationInDays: number;
  initWithdraw: () => void;
  txBusy: boolean;
  holdingToWithdraw: Holding;
}

const V3WithdrawStep3 = ({
  amount,
  lockDurationInDays,
  initWithdraw,
  txBusy,
  holdingToWithdraw,
}: Props) => {
  const { token, poolTokenId } = holdingToWithdraw;

  const approveTokens = useMemo(() => {
    const tokensToApprove = [
      {
        // TODO - use bnTKN for approval based on input amount
        amount: holdingToWithdraw.poolTokenBalance,
        token: {
          ...token,
          address: poolTokenId,
          symbol: `bn${token.symbol}`,
        },
      },
    ];
    if (token.address === bntToken) {
      tokensToApprove.push({
        amount: amount.tkn,
        token: {
          ...token,
          address: getNetworkVariables().govToken,
          symbol: `vBNT`,
        },
      });
    }

    return tokensToApprove;
  }, [amount.tkn, holdingToWithdraw.poolTokenBalance, poolTokenId, token]);

  const [onStart, ModalApprove] = useApproveModal(
    approveTokens,
    initWithdraw,
    ContractsApi.BancorNetwork.contractAddress
  );

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

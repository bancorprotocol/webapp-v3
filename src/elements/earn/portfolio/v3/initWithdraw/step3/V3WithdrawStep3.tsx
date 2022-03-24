import { Button } from 'components/button/Button';
import { memo, useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'redux/portfolio/v3Portfolio.types';

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

  const approveToken = useMemo(
    () => ({
      amount: amount.tkn,
      token: {
        ...token,
        address: poolTokenId,
        symbol: `bn${token.symbol}`,
      },
    }),
    [amount.tkn, poolTokenId, token]
  );

  const [onStart, ModalApprove] = useApproveModal(
    [approveToken],
    initWithdraw,
    ContractsApi.BancorNetwork.contractAddress
  );

  return (
    <>
      <div className="text-center">
        <h1 className="text-[36px] font-normal my-50">
          Start {lockDurationInDays} day cooldown of{' '}
          <span className="text-primary">
            {prettifyNumber(amount.tkn)} {token.symbol}
          </span>
        </h1>
        <div className="flex justify-center">
          <Button className="px-50" onClick={() => onStart()} disabled={txBusy}>
            {txBusy ? 'waiting for confirmation ...' : 'Start cooldown'}
          </Button>
        </div>
      </div>
      {ModalApprove}
    </>
  );
};

export default memo(V3WithdrawStep3);

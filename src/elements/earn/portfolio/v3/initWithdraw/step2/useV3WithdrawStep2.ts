import { useMemo, useState } from 'react';
import { BigNumber } from 'bignumber.js';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { expandToken } from 'utils/formulas';

interface Props {
  holding: Holding;
  amount: AmountTknFiat;
  setStep: (step: number) => void;
}

export const useV3WithdrawStep2 = ({ holding, amount, setStep }: Props) => {
  const { token, standardStakingReward } = holding;
  const [txBusy, setTxBusy] = useState(false);

  const tokenAmountToUnstakeWei = useMemo(() => {
    const amountToUnstake = new BigNumber(amount.tkn)
      .minus(holding.tokenBalance)
      .toString();
    return expandToken(amountToUnstake, token.decimals);
  }, [amount.tkn, holding.tokenBalance, token.decimals]);

  const handleLeave = async () => {
    if (!standardStakingReward) {
      console.error('No standardStakingReward found');
      return;
    }
    setTxBusy(true);
    try {
      const poolTokenAmountWei =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          token.address,
          tokenAmountToUnstakeWei
        );

      const tx = await ContractsApi.StandardRewards.write.leave(
        standardStakingReward.id,
        poolTokenAmountWei
      );
      await tx.wait();
      setStep(3);
    } catch (e) {
      console.error(e);
      setTxBusy(false);
    }
  };

  return { handleLeave, token, txBusy };
};

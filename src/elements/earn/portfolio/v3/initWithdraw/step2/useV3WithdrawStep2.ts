import { useDispatch } from 'react-redux';
import { useAppSelector } from 'redux/index';
import { useMemo } from 'react';
import { BigNumber } from 'bignumber.js';
import { utils } from 'ethers';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';

interface Props {
  holding: Holding;
  amount: AmountTknFiat;
  setStep: (step: number) => void;
}

export const useV3WithdrawStep2 = ({ holding, amount, setStep }: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector<string>((state) => state.user.account);
  const { token, standardStakingReward } = holding;

  const tokenAmountToUnstakeWei = useMemo(() => {
    const amountToUnstake = new BigNumber(amount.tkn)
      .minus(holding.tokenBalance)
      .toString();
    return utils.parseUnits(amountToUnstake, token.decimals);
  }, [amount.tkn, holding.tokenBalance, token.decimals]);

  const handleLeave = async () => {
    if (!standardStakingReward) {
      console.error('No standardStakingReward found');
      return;
    }

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
      await updatePortfolioData(dispatch, account);
      setStep(3);
    } catch (e) {
      console.error(e);
    }
  };

  return { handleLeave, token };
};

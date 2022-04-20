import { Button } from 'components/button/Button';
import { memo, useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { BigNumber } from 'bignumber.js';
import { utils } from 'ethers';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'redux/index';

interface Props {
  amount: AmountTknFiat;
  setStep: (step: number) => void;
  holding: Holding;
}

const V3WithdrawStep2 = ({ setStep, amount, holding }: Props) => {
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

  return (
    <div className="text-center">
      <button onClick={() => setStep(1)}>{'<-'} Change amount</button>
      <h1 className="text-[36px] font-normal my-50">
        Remove{' '}
        <span className="text-primary">
          {prettifyNumber(amount.tkn)} {token.symbol}
        </span>{' '}
        from earning rewards
      </h1>
      <div className="flex justify-center">
        <Button className="px-50" onClick={handleLeave}>
          Remove
        </Button>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep2);

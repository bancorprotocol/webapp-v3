import { Button } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { useCallback, useMemo, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { utils } from 'ethers';
import { useNavigation } from 'services/router';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'store';
import { useApproveModal } from 'hooks/useApproveModal';
import { ModalV3 } from 'components/modal/ModalV3';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { TokenInputPercentageV3 } from 'components/tokenInputPercentage/TokenInputPercentageV3';
import { ethToken } from 'services/web3/config';
import { Switch } from 'components/switch/Switch';
import {
  getAllStandardRewardProgramsByPoolId,
  getTokenById,
} from 'store/bancor/bancor';
import { toBigNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { web3 } from 'services/web3';
import { useConditionalInterval } from 'hooks/useConditionalInterval';

interface Props {
  pool: PoolV3;
  renderButton: (onClick: () => void) => React.ReactNode;
}

const REWARDS_EXTRA_GAS = 130_000;

export const DepositV3Modal = ({ pool, renderButton }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [accessFullEarnings, setAccessFullEarnings] = useState(false);
  const [extraGasNeeded, setExtraGasNeeded] = useState('0');
  const rewardProgram = useAppSelector(
    getAllStandardRewardProgramsByPoolId
  ).get(pool.poolDltId);
  const eth = useAppSelector((state) => getTokenById(state, ethToken));

  const { pushPortfolio } = useNavigation();
  const dispatch = useDispatch();

  const depositDisabled = !account || !amount || Number(amount) === 0;

  const fieldBalance = pool.reserveToken.balance;

  const shouldPollForGasPrice = useMemo(() => {
    return !depositDisabled && accessFullEarnings && !!eth;
  }, [accessFullEarnings, depositDisabled, eth]);

  const updateExtraGasCost = useCallback(async () => {
    if (accessFullEarnings && eth && amount) {
      const gasPrice = toBigNumber(await web3.provider.getGasPrice());
      const extraGasCostUSD = shrinkToken(
        gasPrice.times(REWARDS_EXTRA_GAS).times(eth.usdPrice),
        eth.decimals
      );

      setExtraGasNeeded(extraGasCostUSD);
    } else {
      setExtraGasNeeded('0');
    }
  }, [accessFullEarnings, amount, eth]);

  useConditionalInterval(shouldPollForGasPrice, updateExtraGasCost, 13000);

  const deposit = async () => {
    if (
      !pool.reserveToken.balance ||
      !account ||
      !fieldBalance ||
      !rewardProgram
    ) {
      return;
    }

    const amountWei = utils.parseUnits(amount, pool.reserveToken.decimals);
    const isETH = pool.reserveToken.address === ethToken;

    try {
      const res = accessFullEarnings
        ? await ContractsApi.StandardRewards.write.depositAndJoin(
            rewardProgram.id,
            amountWei
          )
        : await ContractsApi.BancorNetwork.write.deposit(
            pool.poolDltId,
            amountWei,
            { value: isETH ? amountWei : undefined }
          );
      console.log(res);
      setIsOpen(false);
      pushPortfolio();
      await updatePortfolioData(dispatch, account);
    } catch (e) {
      console.error(e);
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    [{ amount: fieldBalance || '0', token: pool.reserveToken }],
    deposit,
    accessFullEarnings
      ? ContractsApi.StandardRewards.contractAddress
      : ContractsApi.BancorNetwork.contractAddress
  );

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <ModalV3
        title={'Deposit & Earn'}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        titleElement={<SwapSwitch />}
        separator
        large
      >
        <div className="p-10">
          <div className="flex flex-col items-center text-12 mx-20">
            <TokenInputPercentageV3
              label="Amount"
              token={pool.reserveToken}
              balance={fieldBalance}
              amount={amount}
              setAmount={setAmount}
              balanceLabel="Available"
            />
            {rewardProgram ? (
              <div className="flex flex-col w-full p-20 rounded bg-fog dark:bg-black-disabled dark:text-primary-light">
                <div className="flex pr-10 mb-4">
                  <span className="mr-20">Access full earnings</span>
                  <Switch
                    selected={accessFullEarnings}
                    onChange={() => setAccessFullEarnings((prev) => !prev)}
                  />
                </div>
                <div>Additional gas ~${extraGasNeeded}</div>
              </div>
            ) : (
              <div className="flex justify-between w-full p-20 rounded bg-fog dark:bg-black-disabled dark:text-primary-light">
                <span>Compunding rewards {pool.reserveToken.symbol}</span>
              </div>
            )}
            <Button
              onClick={() => onStart()}
              disabled={depositDisabled}
              className={`btn-primary rounded w-full mt-30 mb-10`}
            >
              {`Deposit ${pool.name}`}
            </Button>
            {ApproveModal}
          </div>
        </div>
      </ModalV3>
    </>
  );
};

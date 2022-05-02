import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Token } from 'services/observables/tokens';
import { toBigNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { web3 } from 'services/web3';

interface Props {
  pool: PoolV3;
}

const REWARDS_EXTRA_GAS = 130_000;

export const DepositV3Modal = ({ pool }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [accessFullEarnings, setAccessFullEarnings] = useState(false);
  const [extraGasNeeded, setExtraGasNeeded] = useState('0');
  const rewardProgram = useAppSelector(
    getAllStandardRewardProgramsByPoolId
  ).get(pool.poolDltId);
  const eth = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, ethToken)
  );

  const { pushPortfolio } = useNavigation();
  const dispatch = useDispatch();

  const gasPriceInterval = useRef<number | null>(null);

  const depositDisabled = !account || !amount || Number(amount) === 0;

  const fieldBalance = pool.reserveToken.balance;

  const shouldPollForGasPrice = useMemo(() => {
    return (
      pool.reserveToken.balance &&
      account &&
      fieldBalance &&
      accessFullEarnings &&
      eth &&
      amount
    );
  }, [
    accessFullEarnings,
    account,
    amount,
    eth,
    fieldBalance,
    pool.reserveToken.balance,
  ]);

  const updateExtraGasCost = useCallback(async () => {
    console.log('called with', accessFullEarnings, amount, eth);
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

  useEffect(() => {
    if (shouldPollForGasPrice) {
      if (!gasPriceInterval.current) {
        console.log('interval started');
        gasPriceInterval.current = window.setInterval(
          updateExtraGasCost,
          13000
        );
        updateExtraGasCost();
      }
    } else {
      if (gasPriceInterval.current) {
        console.log('interval stopped');
        window.clearInterval(gasPriceInterval.current);
        gasPriceInterval.current = null;
        updateExtraGasCost();
      }
    }
    return () => {
      console.log('clearing interval', gasPriceInterval.current);
      if (gasPriceInterval.current) {
        window.clearInterval(gasPriceInterval.current);
        gasPriceInterval.current = null;
      }
    };
  }, [shouldPollForGasPrice, updateExtraGasCost]);

  const deposit = async () => {
    if (!pool.reserveToken.balance || !account || !fieldBalance) {
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
      <Button
        onClick={() => setIsOpen(true)}
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.EXTRASMALL}
      >
        Deposit
      </Button>
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
                <div className="flex justify-between pr-10 mb-4">
                  Access full earnings
                  <Switch
                    selected={accessFullEarnings}
                    onChange={() => setAccessFullEarnings((prev) => !prev)}
                  />
                  {'40%???'}
                </div>
                <div>Additional gas ~${extraGasNeeded}</div>
                <div>Compounding rewards {pool.reserveToken.symbol} ???30%</div>
              </div>
            ) : (
              <div className="flex justify-between w-full p-20 rounded bg-fog dark:bg-black-disabled dark:text-primary-light">
                <span>Compunding rewards {pool.reserveToken.symbol}</span>
                <span>??40%</span>
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

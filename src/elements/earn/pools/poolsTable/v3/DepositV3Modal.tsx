import { Button, ButtonVariant } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { useCallback, useMemo, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
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
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { expandToken, shrinkToken } from 'utils/formulas';
import { web3 } from 'services/web3';
import { useConditionalInterval } from 'hooks/useConditionalInterval';
import BigNumber from 'bignumber.js';
import {
  confirmDepositNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { ErrorCode } from 'services/web3/types';
import { openWalletModal } from 'store/user/user';
import { ProtectedSettingsV3 } from 'components/protectedSettingsV3/ProtectedSettingsV3';
import { useNavigation } from 'hooks/useNavigation';

interface Props {
  pool: PoolV3;
  renderButton: (onClick: () => void) => React.ReactNode;
}

const REWARDS_EXTRA_GAS = 130_000;

export const DepositV3Modal = ({ pool, renderButton }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [txBusy, setTxBusy] = useState(false);
  const [amount, setAmount] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const [accessFullEarnings, setAccessFullEarnings] = useState(false);
  const [extraGasNeeded, setExtraGasNeeded] = useState('0');
  const rewardProgram = useAppSelector(
    getAllStandardRewardProgramsByPoolId
  ).get(pool.poolDltId);
  const eth = useAppSelector((state) => getTokenById(state, ethToken));

  const isInputError = useMemo(
    () => !!account && new BigNumber(pool.reserveToken.balance || 0).lt(amount),
    [account, amount, pool.reserveToken.balance]
  );

  const dispatch = useDispatch();
  const { goToPage } = useNavigation();

  const deposit = async () => {
    if (!pool.reserveToken.balance || !account || !rewardProgram) {
      return;
    }

    const amountWei = expandToken(amount, pool.reserveToken.decimals);
    const isETH = pool.reserveToken.address === ethToken;

    try {
      setTxBusy(true);
      const tx = accessFullEarnings
        ? await ContractsApi.StandardRewards.write.depositAndJoin(
            rewardProgram.id,
            amountWei
          )
        : await ContractsApi.BancorNetwork.write.deposit(
            pool.poolDltId,
            amountWei,
            { value: isETH ? amountWei : undefined }
          );
      confirmDepositNotification(
        dispatch,
        tx.hash,
        amount,
        pool.reserveToken.symbol
      );
      setTxBusy(false);
      setIsOpen(false);
      goToPage.portfolio();
      await tx.wait();
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      console.error('failed to deposit', e);
      setIsOpen(false);
      setTxBusy(false);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    [{ amount: amount || '0', token: pool.reserveToken }],
    deposit,
    accessFullEarnings
      ? ContractsApi.StandardRewards.contractAddress
      : ContractsApi.BancorNetwork.contractAddress
  );

  const shouldConnect = useMemo(() => !account && amount, [account, amount]);
  const canDeposit = useMemo(
    () => !!account && !!amount && !isInputError && !txBusy,
    [account, amount, isInputError, txBusy]
  );

  const handleClick = useCallback(() => {
    if (canDeposit) {
      onStart();
    } else if (shouldConnect) {
      dispatch(openWalletModal(true));
    }
  }, [canDeposit, dispatch, onStart, shouldConnect]);

  const shouldPollForGasPrice = useMemo(() => {
    return !!amount && !txBusy && accessFullEarnings && !!eth;
  }, [accessFullEarnings, amount, eth, txBusy]);

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
        <div className="p-30 pb-14">
          <TokenInputPercentageV3
            label="Amount"
            balanceLabel="Available"
            token={pool.reserveToken}
            inputTkn={amount}
            inputFiat={inputFiat}
            setInputFiat={setInputFiat}
            setInputTkn={setAmount}
            isFiat={isFiat}
            isError={isInputError}
          />
          <div className="w-full px-20 py-10 mt-20 rounded bg-secondary">
            {rewardProgram ? (
              <>
                <div className="flex pr-10 mb-4">
                  <span className="mr-20">Access full earnings</span>
                  <Switch
                    selected={accessFullEarnings}
                    onChange={() => setAccessFullEarnings((prev) => !prev)}
                  />
                </div>
                <div className="text-12 text-secondary">
                  Additional gas ~{prettifyNumber(extraGasNeeded, true)}
                </div>
              </>
            ) : (
              <span>Compounding rewards {pool.reserveToken.symbol}</span>
            )}
          </div>

          <Button
            onClick={handleClick}
            disabled={!amount || txBusy || isInputError}
            variant={ButtonVariant.PRIMARY}
            className={`w-full mt-20 mb-14`}
          >
            {txBusy
              ? '... waiting for confirmation'
              : shouldConnect
              ? 'Connect your wallet'
              : canDeposit
              ? `Deposit ${pool.name}`
              : 'Enter amount'}
          </Button>
          <ProtectedSettingsV3 />
          {ApproveModal}
        </div>
      </ModalV3>
    </>
  );
};

import { Button, ButtonSize } from 'components/button/Button';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'store';
import { useApproveModal } from 'hooks/useApproveModal';
import { ModalV3 } from 'components/modal/ModalV3';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { ethToken } from 'services/web3/config';
import { Switch } from 'components/switch/Switch';
import { getTokenById } from 'store/bancor/bancor';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { expandToken, shrinkToken } from 'utils/formulas';
import { web3 } from 'services/web3';
import { useConditionalInterval } from 'hooks/useConditionalInterval';
import BigNumber from 'bignumber.js';
import {
  confirmDepositNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { ErrorCode } from 'services/web3/types';
import { ProtectedSettingsV3 } from 'components/protectedSettingsV3/ProtectedSettingsV3';
import { useNavigation } from 'hooks/useNavigation';
import { wait } from 'utils/pureFunctions';
import { ExpandableSection } from 'components/expandableSection/ExpandableSection';
import { ReactComponent as IconChevron } from 'assets/icons/chevronDown.svg';
import { getPoolsV3Map } from 'store/bancor/pool';
import { useWalletConnect } from 'elements/walletConnect/useWalletConnect';
import { TokenInputPercentageV3New } from 'components/tokenInputPercentage/TokenInputPercentageV3New';
import {
  DepositEvent,
  sendDepositEvent,
  setCurrentDeposit,
} from 'services/api/googleTagManager/deposit';
import {
  getBlockchain,
  getBlockchainNetwork,
  getCurrency,
  getFiat,
  getOnOff,
} from 'services/api/googleTagManager';
import { DepositDisabledModal } from './DepositDisabledModal';
import { usePoolPick } from 'queries';

interface Props {
  poolId: string;
  renderButton: (onClick: (pool_click_location?: string) => void) => ReactNode;
}

const REWARDS_EXTRA_GAS = 130_000;

export const DepositV3Modal = ({ poolId, renderButton }: Props) => {
  const { getOne } = usePoolPick([
    'balance',
    'symbol',
    'latestProgram',
    'decimals',
    'apr',
  ]);
  const { data: pool } = getOne(poolId);
  const enableDeposit = useAppSelector((state) => state.user.enableDeposit);
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [txBusy, setTxBusy] = useState(false);
  const [amount, setAmount] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const [accessFullEarnings, setAccessFullEarnings] = useState(true);
  const [extraGasNeeded, setExtraGasNeeded] = useState('0');
  const eth = useAppSelector((state) => getTokenById(state, ethToken));
  const poolV3Map = useAppSelector(getPoolsV3Map);
  const { handleWalletButtonClick } = useWalletConnect();

  const onClose = async () => {
    setIsOpen(false);
    await wait(500);
    setAmount('');
    setInputFiat('');
    setExtraGasNeeded('0');
    setAccessFullEarnings(true);
  };

  const isInputError = useMemo(
    () => !!account && new BigNumber(pool?.balance?.tkn || 0).lt(amount),
    [account, amount, pool?.balance?.tkn]
  );

  const dispatch = useDispatch();
  const { goToPage } = useNavigation();

  const deposit = async (approvalHash?: string) => {
    if (!pool || !pool.balance?.tkn || !account) {
      return;
    }

    if (approvalHash)
      sendDepositEvent(
        DepositEvent.DepositWalletUnlimitedConfirm,
        undefined,
        undefined,
        approvalHash
      );

    sendDepositEvent(DepositEvent.DepositWalletRequest);
    const amountWei = expandToken(amount, pool.decimals);
    const isETH = poolId === ethToken;

    try {
      setTxBusy(true);
      const tx =
        accessFullEarnings && pool.latestProgram?.isActive
          ? await ContractsApi.StandardRewards.write.depositAndJoin(
              pool.latestProgram.id,
              amountWei,
              { value: isETH ? amountWei : undefined }
            )
          : await ContractsApi.BancorNetwork.write.deposit(poolId, amountWei, {
              value: isETH ? amountWei : undefined,
            });
      sendDepositEvent(
        DepositEvent.DepositWalletConfirm,
        undefined,
        undefined,
        tx.hash
      );
      confirmDepositNotification(dispatch, tx.hash, amount, pool.symbol);
      setTxBusy(false);
      onClose();
      goToPage.portfolio();
      await tx.wait();
      sendDepositEvent(
        DepositEvent.DepositSuccess,
        undefined,
        undefined,
        tx.hash
      );
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      console.error('failed to deposit', e);
      sendDepositEvent(DepositEvent.DepositFailed, undefined, e.message);
      onClose();
      setTxBusy(false);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      } else {
        genericFailedNotification(dispatch, 'Deposit failed');
      }
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    [
      {
        amount: amount || '0',
        token: {
          address: poolId,
          symbol: pool?.symbol ?? 'N/A',
          decimals: pool?.decimals ?? 18,
        },
      },
    ],
    (approvalHash?: string) => deposit(approvalHash),
    accessFullEarnings && pool?.latestProgram?.isActive
      ? ContractsApi.StandardRewards.contractAddress
      : ContractsApi.BancorNetwork.contractAddress,
    () => sendDepositEvent(DepositEvent.DepositUnlimitedPopupRequest),

    (isUnlimited: boolean) => {
      sendDepositEvent(DepositEvent.DepositUnlimitedPopupConfirm, isUnlimited);
      sendDepositEvent(DepositEvent.DepositWalletUnlimitedRequest);
    }
  );

  const shouldConnect = useMemo(() => !account && amount, [account, amount]);
  const canDeposit = useMemo(
    () => !!account && !!amount && +amount > 0 && !isInputError && !txBusy,
    [account, amount, isInputError, txBusy]
  );

  const handleClick = useCallback(() => {
    if (canDeposit && pool) {
      const portion =
        pool?.balance &&
        new BigNumber(amount).div(pool?.balance.tkn).times(100).toFixed(0);
      const deposit_portion =
        portion &&
        (portion === '25' ||
          portion === '50' ||
          portion === '75' ||
          portion === '100')
          ? portion
          : '(no value)';
      setCurrentDeposit({
        deposit_pool: pool.symbol,
        deposit_blockchain: getBlockchain(),
        deposit_blockchain_network: getBlockchainNetwork(),
        deposit_input_type: getFiat(isFiat),
        deposit_token: pool.symbol,
        deposit_token_amount: amount,
        deposit_token_amount_usd: inputFiat,
        deposit_portion,
        deposit_access_full_earning: getOnOff(accessFullEarnings),
        deposit_display_currency: getCurrency(),
      });
      sendDepositEvent(DepositEvent.DepositAmountContinue);
      onStart();
    } else if (shouldConnect) {
      handleWalletButtonClick();
    }
  }, [
    canDeposit,
    onStart,
    shouldConnect,
    handleWalletButtonClick,
    accessFullEarnings,
    amount,
    inputFiat,
    isFiat,
    pool,
  ]);

  const shouldPollForGasPrice = useMemo(() => {
    return !!amount && !txBusy && accessFullEarnings && !!eth;
  }, [accessFullEarnings, amount, eth, txBusy]);

  const updateExtraGasCost = useCallback(async () => {
    if (!isOpen) return;
    if (accessFullEarnings && eth) {
      const gasPrice = toBigNumber(await web3.provider.getGasPrice());
      const extraGasCostUSD = shrinkToken(
        gasPrice.times(REWARDS_EXTRA_GAS).times(eth.usdPrice),
        eth.decimals
      );

      setExtraGasNeeded(extraGasCostUSD);
    } else {
      setExtraGasNeeded('0');
    }
  }, [accessFullEarnings, eth, isOpen]);

  useConditionalInterval(shouldPollForGasPrice, updateExtraGasCost, 13000);

  if (!enableDeposit)
    return <DepositDisabledModal renderButton={renderButton} />;

  if (!pool) return null;

  return (
    <>
      {renderButton((pool_click_location) => {
        setCurrentDeposit({
          deposit_pool: pool.symbol,
          deposit_blockchain: getBlockchain(),
          deposit_blockchain_network: getBlockchainNetwork(),
          deposit_input_type: getFiat(isFiat),
          deposit_token: pool.symbol,
          deposit_token_amount: undefined,
          deposit_token_amount_usd: undefined,
          deposit_portion: undefined,
          deposit_access_full_earning: getOnOff(accessFullEarnings),
          deposit_display_currency: getCurrency(),
        });
        sendDepositEvent(
          DepositEvent.DepositPoolClick,
          undefined,
          undefined,
          undefined,
          pool_click_location
        );
        sendDepositEvent(DepositEvent.DepositAmountView);
        setIsOpen(true);
      })}
      <ModalV3
        title={'Deposit & Earn'}
        setIsOpen={onClose}
        isOpen={isOpen}
        titleElement={<SwapSwitch />}
        separator
        large
      >
        <div className="p-30 pb-14">
          <TokenInputPercentageV3New
            label="Amount"
            balanceLabel="Available"
            dltId={poolId}
            inputTkn={amount}
            inputFiat={inputFiat}
            setInputFiat={setInputFiat}
            setInputTkn={setAmount}
            isFiat={isFiat}
            isError={isInputError}
          />

          {pool.latestProgram?.isActive ? (
            <ExpandableSection
              className="p-10 mt-20 rounded bg-secondary"
              renderButtonChildren={(isExpanded) => (
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex justify-between text-black dark:text-white">
                        <span className="mr-10">Join rewards program</span>
                        {/* we wrap with this span so that toggling won't expand the whole section */}
                        <span onClick={(e: any) => e.stopPropagation()}>
                          <Switch
                            selected={accessFullEarnings}
                            onChange={() =>
                              setAccessFullEarnings((prev) => !prev)
                            }
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>
                        {accessFullEarnings
                          ? pool.apr?.apr7d.total.toFixed(2)
                          : pool.apr?.apr7d.tradingFees.toFixed(2)}
                        %
                      </span>
                      <IconChevron
                        className={`w-14 ml-10 ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-12 text-secondary">
                    Additional gas {prettifyNumber(extraGasNeeded, true)}
                  </div>
                </div>
              )}
            >
              <div className="flex flex-col w-full">
                <div className="flex justify-between w-full pl-20 pr-[44px] py-10 rounded bg-secondary items-center h-[50px]">
                  <span>
                    <span>Compounding rewards</span>{' '}
                    <span className="text-secondary">{pool.symbol}</span>
                  </span>
                  <span>{pool.apr?.apr7d.tradingFees.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between w-full pl-20 pr-[44px] py-10 rounded bg-secondary items-center h-[40px]">
                  <span>
                    <span>Standard rewards</span>{' '}
                    <span className="text-secondary">
                      {poolV3Map.get(pool.latestProgram.rewardsToken)
                        ?.reserveToken.symbol ?? ''}
                    </span>
                  </span>
                  <span>
                    {accessFullEarnings
                      ? pool.apr?.apr7d.standardRewards.toFixed(2)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </ExpandableSection>
          ) : (
            <div className="flex justify-between w-full px-20 py-10 mt-20 rounded bg-secondary items-center h-[50px]">
              <span>
                <span>Compounding rewards</span>{' '}
                <span className="text-secondary">{pool.symbol}</span>
              </span>
              <span>{pool.apr?.apr7d.tradingFees.toFixed(2)}%</span>
            </div>
          )}

          <Button
            onClick={handleClick}
            disabled={!amount || +amount === 0 || txBusy || isInputError}
            size={ButtonSize.Full}
            className="mt-20 mb-14"
          >
            {txBusy
              ? '... waiting for confirmation'
              : shouldConnect
              ? 'Connect your wallet'
              : canDeposit
              ? `Deposit ${pool.symbol}`
              : 'Enter amount'}
          </Button>
          <ProtectedSettingsV3 />
          {ApproveModal}
        </div>
      </ModalV3>
    </>
  );
};

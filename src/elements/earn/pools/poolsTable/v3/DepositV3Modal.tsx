import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'store';
import { useApproveModal } from 'hooks/useApproveModal';
import { ModalV3 } from 'components/modal/ModalV3';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { bntToken, ethToken } from 'services/web3/config';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { expandToken } from 'utils/formulas';
import BigNumber from 'bignumber.js';
import {
  confirmDepositNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { ErrorCode } from 'services/web3/types';
import { useNavigation } from 'hooks/useNavigation';
import { wait } from 'utils/pureFunctions';
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
import { checkV3DepositWhitelist } from 'utils/v3Deposit';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTknFiatInput } from 'elements/trade/useTknFiatInput';
import { DepositFAQ } from './DepositFAQ';
import { Switch, SwitchVariant } from 'components/switch/Switch';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface Props {
  pool: PoolV3;
  renderButton: (onClick: (pool_click_location?: string) => void) => ReactNode;
}

export const DepositV3Modal = ({ pool, renderButton }: Props) => {
  const isBNT = bntToken === pool.poolDltId;
  const adminEnableDeposit = useAppSelector(
    (state) => state.user.enableDeposit
  );
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [txBusy, setTxBusy] = useState(false);
  const [tosAgreed, setTosAgreed] = useState(false);
  const [amount, setAmount] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const [accessFullEarnings, setAccessFullEarnings] = useState(true);
  const { openConnectModal: handleWalletButtonClick } = useConnectModal();

  const tokenInputField = useTknFiatInput({
    token: pool.reserveToken,
    setInputTkn: setAmount,
    setInputFiat: setInputFiat,
    inputTkn: amount,
    inputFiat: inputFiat,
  });

  const enableDeposit =
    adminEnableDeposit ||
    (pool.depositingEnabled && checkV3DepositWhitelist(pool.poolDltId));

  const onClose = async () => {
    setIsOpen(false);
    await wait(500);
    setAmount('');
    setInputFiat('');
    setAccessFullEarnings(true);
  };

  const inputErrorMsg = useMemo(
    () =>
      !!account && new BigNumber(pool.reserveToken.balance || 0).lt(amount)
        ? 'Insufficient balance'
        : '',
    [account, amount, pool.reserveToken.balance]
  );

  const dispatch = useDispatch();
  const { goToPage } = useNavigation();

  const deposit = async (approvalHash?: string) => {
    if (!pool.reserveToken.balance || !account) {
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
    const amountWei = expandToken(amount, pool.reserveToken.decimals);
    const isETH = pool.reserveToken.address === ethToken;

    try {
      setTxBusy(true);
      const tx =
        accessFullEarnings && pool.latestProgram?.isActive
          ? await ContractsApi.StandardRewards.write.depositAndJoin(
              pool.latestProgram.id,
              amountWei,
              { value: isETH ? amountWei : undefined }
            )
          : await ContractsApi.BancorNetwork.write.deposit(
              pool.reserveToken.address,
              amountWei,
              { value: isETH ? amountWei : undefined }
            );
      sendDepositEvent(
        DepositEvent.DepositWalletConfirm,
        undefined,
        undefined,
        tx.hash
      );
      confirmDepositNotification(
        dispatch,
        tx.hash,
        amount,
        pool.reserveToken.symbol
      );
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
    [{ amount: amount || '0', token: pool.reserveToken }],
    (approvalHash?: string) => deposit(approvalHash),
    accessFullEarnings && pool.latestProgram?.isActive
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
    () => !!account && !!amount && +amount > 0 && !inputErrorMsg && !txBusy,
    [account, amount, inputErrorMsg, txBusy]
  );

  const handleClick = useCallback(() => {
    if (canDeposit) {
      const portion =
        pool.reserveToken.balance &&
        new BigNumber(amount)
          .div(pool.reserveToken.balance)
          .times(100)
          .toFixed(0);
      const deposit_portion =
        portion &&
        (portion === '25' ||
          portion === '50' ||
          portion === '75' ||
          portion === '100')
          ? portion
          : '(no value)';
      setCurrentDeposit({
        deposit_pool: pool.name,
        deposit_blockchain: getBlockchain(),
        deposit_blockchain_network: getBlockchainNetwork(),
        deposit_input_type: getFiat(isFiat),
        deposit_token: pool.name,
        deposit_token_amount: amount,
        deposit_token_amount_usd: inputFiat,
        deposit_portion,
        deposit_access_full_earning: getOnOff(accessFullEarnings),
        deposit_display_currency: getCurrency(),
      });
      sendDepositEvent(DepositEvent.DepositAmountContinue);
      onStart();
    } else if (shouldConnect && handleWalletButtonClick) {
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
    pool.name,
    pool.reserveToken.balance,
  ]);

  const vaultBalance = toBigNumber(pool.liquidity.usd)
    .div(pool.stakedBalance.usd)
    .minus(1)
    .times(100);

  if (!enableDeposit)
    return <DepositDisabledModal renderButton={renderButton} />;

  return (
    <>
      {renderButton((pool_click_location) => {
        setCurrentDeposit({
          deposit_pool: pool.name,
          deposit_blockchain: getBlockchain(),
          deposit_blockchain_network: getBlockchainNetwork(),
          deposit_input_type: getFiat(isFiat),
          deposit_token: pool.name,
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
        title={'Deposit'}
        setIsOpen={onClose}
        isOpen={isOpen}
        titleElement={<SwapSwitch />}
        large
      >
        <>
          <div className="p-30 pb-14">
            <TradeWidgetInput
              label={'Amount'}
              input={tokenInputField}
              errorMsg={inputErrorMsg}
              disableSelection
            />

            {!isBNT && (
              <>
                <div className="flex justify-between w-full px-20 py-10 mt-30 rounded bg-secondary items-center h-[50px]">
                  <span>
                    <span>Vault Balance</span>
                  </span>
                  <span
                    className={`${
                      vaultBalance.gte(0) ? 'text-primary' : 'text-error'
                    }`}
                  >
                    {vaultBalance.gte(0) ? '+' : ''}
                    {vaultBalance.toFixed(2)}%
                  </span>
                </div>
                <p className={'text-secondary mt-20'}>
                  {vaultBalance.gte(0)
                    ? 'This pool is currently NOT in deficit. This may change over time. Should this pool be in deficit when you’re ready to withdraw, your deposit will accrue the pool deficit at that time.'
                    : `This pool is in deficit. If an immediate withdrawal were initiated, the claimable amount will be ${
                        amount
                          ? prettifyNumber(
                              toBigNumber(amount).minus(
                                vaultBalance.div(100).times(-1).times(amount)
                              )
                            )
                          : '--'
                      } ${
                        pool.name
                      }. Its value and deficit amount can change over time.`}
                </p>
                <div
                  className={
                    'flex justify-between mt-20 space-x-20 items-center text-error'
                  }
                >
                  <Switch
                    variant={SwitchVariant.ERROR}
                    selected={tosAgreed}
                    onChange={setTosAgreed}
                  />
                  <button
                    className={'text-left'}
                    onClick={() => setTosAgreed((prev) => !prev)}
                  >
                    I understand and accept the risk of depositing into a pool
                    while BNT distribution is disabled.
                  </button>
                </div>
              </>
            )}

            <Button
              onClick={handleClick}
              disabled={
                !amount ||
                +amount === 0 ||
                txBusy ||
                !!inputErrorMsg ||
                (!tosAgreed && !isBNT)
              }
              size={ButtonSize.Full}
              className="mt-30 mb-14"
              variant={ButtonVariant.Secondary}
            >
              {txBusy
                ? '... waiting for confirmation'
                : shouldConnect
                ? 'Connect your wallet'
                : !!inputErrorMsg
                ? inputErrorMsg
                : !amount
                ? 'Enter amount'
                : `Deposit ${pool.name}`}
            </Button>
            {ApproveModal}
          </div>
          {!isBNT && <DepositFAQ />}
        </>
      </ModalV3>
    </>
  );
};

import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from 'store';
import { getTokenV2ById } from 'store/bancor/bancor';
import { Token } from 'services/observables/tokens';
import {
  fetchProtectedPositions,
  ProtectedPosition,
  withdrawProtection,
} from 'services/web3/protection/positions';
import { useApproveModal } from 'hooks/useApproveModal';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import BigNumber from 'bignumber.js';
import {
  rejectNotification,
  withdrawProtectedPosition,
  withdrawProtectedPositionFailed,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { setProtectedPositions } from 'store/liquidity/liquidity';
import { SwapSwitch } from '../../../swapSwitch/SwapSwitch';
import { wait } from 'utils/pureFunctions';
import { ApprovalContract } from 'services/web3/approval';
import {
  sendLiquidityApprovedEvent,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from 'services/api/googleTagManager/liquidity';
import { Pool } from 'services/observables/pools';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Events } from 'services/api/googleTagManager';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTknFiatInput } from 'elements/trade/useTknFiatInput';
import { ModalV3 } from 'components/modal/ModalV3';
import { DepositFAQ } from 'elements/earn/pools/poolsTable/v3/DepositFAQ';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { Switch, SwitchVariant } from 'components/switch/Switch';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';

interface Props {
  protectedPosition: ProtectedPosition;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const WithdrawLiquidityWidget = ({
  protectedPosition,
  isModalOpen,
  setIsModalOpen,
}: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const { positionId, reserveToken, pool } = protectedPosition;
  const { tknAmount } = protectedPosition.claimableAmount;

  const [amount, setAmount] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const tokenInputField = useTknFiatInput({
    token: {
      address: reserveToken.address,
      decimals: reserveToken.decimals,
      logoURI: reserveToken.logoURI,
      symbol: reserveToken.symbol,
      balance: tknAmount,
      balanceUsd: Number(tknAmount) * Number(reserveToken.usdPrice),
      usdPrice: reserveToken.usdPrice?.toString(),
    },
    setInputTkn: setAmount,
    setInputFiat: setInputFiat,
    inputTkn: amount,
    inputFiat: inputFiat,
  });

  const inputErrorMsg = useMemo(
    () =>
      !!account && new BigNumber(reserveToken.balance || 0).lt(amount)
        ? 'Insufficient balance'
        : '',
    [account, amount, reserveToken.balance]
  );

  const isBNT = bntToken === reserveToken.address;
  const token = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, reserveToken.address)
  );
  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const gov = getNetworkVariables().govToken;
  const govToken = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, gov)
  );

  const withdrawingBNT = reserveToken.address === bntToken;
  const emtpyAmount = amount.trim() === '' || Number(amount) === 0;
  const tokenInsufficent = Number(amount) > Number(tknAmount);
  const [agreed, setAgreed] = useState(false);
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);

  const showVBNTWarning = useMemo(() => {
    if (token && token.address !== bntToken) {
      return false;
    }
    if (!amount) {
      return false;
    }
    const govTokenBalance = govToken ? govToken.balance ?? 0 : 0;
    const initalStake = protectedPosition.initialStake.tknAmount;
    return new BigNumber(amount)
      .div(tknAmount)
      .times(initalStake)
      .gt(govTokenBalance);
  }, [
    amount,
    govToken,
    protectedPosition.initialStake.tknAmount,
    tknAmount,
    token,
  ]);

  const withdrawDisabled = emtpyAmount || tokenInsufficent || showVBNTWarning;

  const withdraw = useCallback(async () => {
    if (token) {
      let transactionId: string;
      await withdrawProtection(
        positionId,
        amount,
        tknAmount,
        (txHash: string) => {
          transactionId = txHash;
          withdrawProtectedPosition(dispatch, token, amount, txHash);
          setIsModalOpen(false);
        },
        async () => {
          sendLiquiditySuccessEvent(transactionId);
          const positions = await fetchProtectedPositions(pools, account!);
          dispatch(setProtectedPositions(positions));
        },
        () => {
          sendLiquidityFailEvent('User rejected transaction');
          rejectNotification(dispatch);
        },
        (errorMsg) => {
          sendLiquidityFailEvent(errorMsg);
          withdrawProtectedPositionFailed(dispatch, token, amount);
        }
      );
    }
    setIsModalOpen(false);
  }, [
    account,
    amount,
    dispatch,
    pools,
    positionId,
    setIsModalOpen,
    tknAmount,
    token,
  ]);

  const [onStart, ModalApprove] = useApproveModal(
    govToken ? [{ amount: amount, token: govToken }] : [],
    withdraw,
    ApprovalContract.LiquidityProtection,
    sendLiquidityEvent,
    sendLiquidityApprovedEvent
  );

  const deficitAmount =
    protectedPosition.vaultBalance < 0
      ? (1 - protectedPosition.vaultBalance / 100) *
        Number(protectedPosition.claimableAmount.tknAmount)
      : undefined;

  const handleWithdraw = useCallback(async () => {
    const amountUsd = new BigNumber(amount)
      .times(token ? token.usdPrice ?? 0 : 0)
      .toString();

    const percentage = new BigNumber(amount).div(tknAmount).toFixed(0);
    const userSelectedPercentage =
      percentage === '25' ||
      percentage === '50' ||
      percentage === '75' ||
      percentage === '100';
    setCurrentLiquidity(
      'Withdraw Single',
      pool.name,
      token!.symbol,
      amount,
      amountUsd,
      undefined,
      undefined,
      fiatToggle,
      userSelectedPercentage ? percentage : undefined
    );
    sendLiquidityEvent(Events.click);
    if (withdrawingBNT) {
      setIsModalOpen(false);
      await wait(1000);
      onStart();
    } else withdraw();
  }, [
    amount,
    fiatToggle,
    onStart,
    pool.name,
    setIsModalOpen,
    tknAmount,
    token,
    withdraw,
    withdrawingBNT,
  ]);

  return (
    <ModalV3
      title="Withdraw"
      setIsOpen={setIsModalOpen}
      isOpen={isModalOpen}
      titleElement={<SwapSwitch />}
      large
    >
      <>
        <div className="px-30 pb-20">
          <TradeWidgetInput
            label={'Amount'}
            input={tokenInputField}
            errorMsg={inputErrorMsg}
            disableSelection
          />
          {withdrawingBNT && (
            <div className="mt-20">
              BNT withdrawals are subject to a 24h lock period before they can
              be claimed.
            </div>
          )}
          {showVBNTWarning && (
            <div className="p-20 rounded bg-error font-medium mt-20 text-white">
              Insufficient vBNT balance.
            </div>
          )}
          {!isBNT && (
            <>
              <div className="flex flex-col gap-20 mt-40 text-black-medium dark:text-white-medium ">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    Vault Balance
                    {deficitAmount && (
                      <PopoverV3
                        buttonElement={() => (
                          <IconInfo className="w-10 h-10 text-secondary" />
                        )}
                      >
                        This pool is in deficit. The claimable amount will be
                        {deficitAmount} {reserveToken.symbol}.
                      </PopoverV3>
                    )}
                  </div>
                  <span
                    className={`${
                      protectedPosition.vaultBalance > 0
                        ? 'text-primary'
                        : 'text-error'
                    }`}
                  >
                    {protectedPosition.vaultBalance > 0 ? '+' : ''}
                    {protectedPosition.vaultBalance.toFixed(2)}%
                  </span>
                </div>
              </div>
              <hr className="border-silver dark:border-black-low my-20" />
              <div className="text-secondary">
                Depending on the state of the liquidity pool being withdrawn
                from, positional impermanent loss in addition to a pro rata loss
                may be experienced upon withdrawal. Migration of user funds from
                v2.1 to v3 will remain permanently disabled.
              </div>
              {deficitAmount && (
                <p className={'text-secondary mt-20'}>
                  This pool is in deficit. The claimable amount will be{' '}
                  {deficitAmount} {reserveToken.symbol}.
                </p>
              )}
              <div
                className={
                  'flex justify-between mt-20 space-x-20 items-center text-error'
                }
              >
                <Switch
                  variant={SwitchVariant.ERROR}
                  selected={agreed}
                  onChange={setAgreed}
                />
                <button
                  className={'text-left'}
                  onClick={() => setAgreed(!agreed)}
                >
                  BNT distribution is currently disabled. I understand I may be
                  withdrawing at a loss if the {reserveToken.symbol} vault is in
                  deficit.
                </button>
              </div>
            </>
          )}
          <Button
            onClick={handleWithdraw}
            disabled={withdrawDisabled}
            size={ButtonSize.Full}
            variant={ButtonVariant.Secondary}
            className="mt-20"
          >
            {emtpyAmount ? 'Enter Amount' : 'Withdraw'}
          </Button>
          {ModalApprove}
        </div>
        {!isBNT && <DepositFAQ />}
      </>
    </ModalV3>
  );
};

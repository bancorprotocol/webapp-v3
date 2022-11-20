import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from 'store';
import { getTokenV2ById } from 'store/bancor/bancor';
import { Token, TokenMinimal } from 'services/observables/tokens';
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
import { ModalV3 } from 'components/modal/ModalV3';
import { DepositFAQ } from 'elements/earn/pools/poolsTable/v3/DepositFAQ';
import { Switch, SwitchVariant } from 'components/switch/Switch';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTknFiatInput } from 'elements/trade/useTknFiatInput';

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
  const usdAmount = Number(tknAmount) * Number(reserveToken.usdPrice);
  const tokenMinimal = {
    address: reserveToken.address,
    decimals: reserveToken.decimals,
    logoURI: reserveToken.logoURI,
    symbol: reserveToken.symbol,
    balance: tknAmount,
    balanceUsd: usdAmount,
    usdPrice: reserveToken.usdPrice?.toString(),
  } as TokenMinimal;

  const tokenInputField = useTknFiatInput({
    token: tokenMinimal,
    setInputTkn: () => {},
    setInputFiat: () => {},
    inputTkn: tknAmount,
    inputFiat: usdAmount.toString(),
  });

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
  const [agreed, setAgreed] = useState(false);
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);

  const bntToVBNTRatio = useMemo(() => {
    if (token && token.address !== bntToken) {
      return 0;
    }

    const govTokenBalance = govToken ? govToken.balance ?? 0 : 0;
    const initalStake = protectedPosition.initialStake.tknAmount;
    return new BigNumber(initalStake).minus(govTokenBalance).toNumber();
  }, [govToken, protectedPosition.initialStake.tknAmount, token]);
  const showVBNTWarning = bntToVBNTRatio > 0;

  const withdrawDisabled = showVBNTWarning || (!agreed && !isBNT);

  const onClose = useCallback(() => {
    setIsModalOpen(false);
    setAgreed(false);
  }, [setIsModalOpen, setAgreed]);

  const withdraw = useCallback(async () => {
    if (token) {
      let transactionId: string;
      await withdrawProtection(
        positionId,
        tknAmount,
        (txHash: string) => {
          transactionId = txHash;
          withdrawProtectedPosition(dispatch, token, tknAmount, txHash);
          onClose();
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
          withdrawProtectedPositionFailed(dispatch, token, tknAmount);
        }
      );
    }
    onClose();
  }, [account, dispatch, pools, positionId, onClose, tknAmount, token]);

  const [onStart, ModalApprove] = useApproveModal(
    govToken ? [{ amount: tknAmount, token: govToken }] : [],
    withdraw,
    ApprovalContract.LiquidityProtection,
    sendLiquidityEvent,
    sendLiquidityApprovedEvent
  );

  const handleWithdraw = useCallback(async () => {
    const amountUsd = new BigNumber(tknAmount)
      .times(token ? token.usdPrice ?? 0 : 0)
      .toString();

    setCurrentLiquidity(
      'Withdraw Single',
      pool.name,
      token!.symbol,
      tknAmount,
      amountUsd,
      undefined,
      undefined,
      fiatToggle,
      undefined
    );
    sendLiquidityEvent(Events.click);
    if (withdrawingBNT) {
      setIsModalOpen(false);
      await wait(1000);
      onStart();
    } else withdraw();
  }, [
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
    <>
      <ModalV3 title="Withdraw" setIsOpen={onClose} isOpen={isModalOpen} large>
        <>
          <div className="px-30 pb-20">
            <TradeWidgetInput
              label={'Full Amount'}
              input={tokenInputField}
              disableSelection
              readOnly
            />

            {withdrawingBNT && (
              <div className="mt-20">
                BNT withdrawals are subject to a 24h lock period before they can
                be claimed.
              </div>
            )}
            {showVBNTWarning && (
              <div className="p-20 rounded bg-error font-medium mt-20 text-white">
                Insufficient vBNT balance. You need an additional{' '}
                {bntToVBNTRatio} vBNT in order to withdraw
              </div>
            )}
            {!isBNT && (
              <>
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
                    BNT distribution is currently disabled. I understand I may
                    be withdrawing at a loss if the {reserveToken.symbol} vault
                    is in deficit.
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
              Withdraw
            </Button>
          </div>
          {!isBNT && <DepositFAQ />}
        </>
      </ModalV3>
      {ModalApprove}
    </>
  );
};

import { useAppSelector } from 'store/index';
import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from 'hooks/useNavigation';
import { swap } from 'services/web3/swap/market';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { toBigNumber } from 'utils/helperFunctions';
import { TokenMinimal, updateUserBalances } from 'services/observables/tokens';
import { useApproveModal } from 'hooks/useApproveModal';
import { UseTradeWidgetReturn } from 'elements/trade/useTradeWidget';
import {
  rejectNotification,
  swapFailedNotification,
  swapNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { openWalletModal, TokenCurrency } from 'store/user/user';
import { ApprovalContract } from 'services/web3/approval';
import { ethToken, wethToken } from 'services/web3/config';
import { withdrawWeth } from 'services/web3/swap/limit';
import { addNotification } from 'store/notification/notification';
import {
  Events,
  getLimitMarket,
  getRegularAdvanced,
} from 'services/api/googleTagManager';
import {
  sendConversionEvent,
  setCurrentConversion,
} from 'services/api/googleTagManager/conversion';
import BigNumber from 'bignumber.js';

export interface UseTradeReturn {
  ApproveModal: JSX.Element;
  isBusy: boolean;
  handleSelectSwitch: () => void;
  errorInsufficientBalance: string | undefined;
  handleSelectTo: (token: TokenMinimal) => void;
  handleSelectFrom: (token: TokenMinimal) => void;
  handleCTAClick: () => void;
}

export const useTrade = ({
  fromInput,
  toInput,
  isV3,
  isExternal,
}: UseTradeWidgetReturn): UseTradeReturn => {
  const dispatch = useDispatch();
  const slippageTolerance = useAppSelector(
    (state) => state.user.slippageTolerance
  );
  const account = useAppSelector((state) => state.user.account);
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;

  const [isBusy, setIsBusy] = useState(false);

  const { goToPage } = useNavigation();

  const handleTrade = async () => {
    if (!fromInput || !toInput || !account) {
      return;
    }

    if (fromInput.token.address === wethToken) {
      dispatch(addNotification(await withdrawWeth(fromInput.inputTkn)));
      setIsBusy(false);
      return;
    }

    const fromToken = fromInput.token;
    const toToken = toInput.token;
    const fromAmount = fromInput.inputTkn;
    const fromAmountUsd = fromInput.inputFiat;
    const toAmount = toInput.inputTkn;
    const toAmountUsd = toInput.inputFiat;
    const tokenPair = fromToken.symbol + '/' + toToken.symbol;
    const rate = new BigNumber(toAmount).div(fromAmount).toFixed(4);
    setCurrentConversion(
      getLimitMarket(false),
      tokenPair,
      fromToken.symbol,
      toToken.symbol,
      fromAmount,
      fromAmountUsd,
      toAmount,
      toAmountUsd,
      isCurrency,
      rate,
      undefined,
      undefined,
      getRegularAdvanced(slippageTolerance),
      isV3
    );

    await swap(
      isV3,
      isExternal,
      account,
      slippageTolerance,
      fromInput.token,
      toInput.token,
      fromInput.inputTkn,
      toInput.inputTkn,
      (txHash: string) =>
        swapNotification(
          dispatch,
          fromInput.token,
          toInput.token,
          fromInput.inputTkn,
          toInput.inputTkn,
          txHash
        ),
      async () => {
        sendConversionEvent(Events.success);
        await updateUserBalances();
      },
      () => rejectNotification(dispatch),
      (message: string) => {
        sendConversionEvent(Events.fail, undefined, undefined, message);
        swapFailedNotification(
          dispatch,
          fromInput.token,
          toInput.token,
          fromInput.inputTkn,
          toInput.inputTkn
        );
      }
    );

    setIsBusy(false);
    fromInput.setInputTkn('');
    fromInput.setInputFiat('');
    toInput.setInputTkn('');
    toInput.setInputFiat('');
  };

  const handleCTAClick = () => {
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }
    setIsBusy(true);
    onStart();
  };

  const tokensToApprove = fromInput
    ? [{ token: fromInput.token, amount: fromInput.inputTkn }]
    : [];

  const contractToApprove = isExternal
    ? ContractsApi.ZeroEx.contractAddress
    : isV3
    ? ContractsApi.BancorNetwork.contractAddress
    : ApprovalContract.BancorNetwork;

  const [onStart, ApproveModal] = useApproveModal(
    tokensToApprove,
    handleTrade,
    contractToApprove,
    () => sendConversionEvent(Events.approvePop),
    (isUnlimited) => {
      sendConversionEvent(Events.approved, undefined, isUnlimited);
    },
    () => {
      setIsBusy(false);
      if (fromInput && toInput) {
        fromInput.setInputTkn('');
        fromInput.setInputFiat('');
        toInput.setInputTkn('');
        toInput.setInputFiat('');
      }
    }
  );

  const handleSelectFrom = useCallback(
    (token: TokenMinimal) => {
      goToPage.trade(
        {
          from: token.address,
          to: token.address === wethToken ? ethToken : toInput?.token.address,
        },
        true
      );
    },
    [goToPage, toInput?.token.address]
  );

  const handleSelectTo = useCallback(
    (token: TokenMinimal) => {
      goToPage.trade(
        {
          from: fromInput?.token.address,
          to: token.address,
        },
        true
      );
    },
    [fromInput?.token.address, goToPage]
  );

  const handleSelectSwitch = useCallback(() => {
    goToPage.trade(
      {
        from: toInput?.token.address,
        to:
          fromInput?.token.address === wethToken || !toInput?.token.address
            ? undefined
            : fromInput?.token.address,
      },
      true
    );
  }, [fromInput?.token.address, goToPage, toInput?.token.address]);

  const errorInsufficientBalance = useMemo(
    () =>
      toBigNumber(fromInput?.inputTkn || 0).gt(fromInput?.token.balance || 0) &&
      account
        ? 'Token balance insufficient'
        : undefined,
    [account, fromInput?.inputTkn, fromInput?.token.balance]
  );

  return {
    handleCTAClick,
    ApproveModal,
    isBusy,
    handleSelectFrom,
    handleSelectTo,
    handleSelectSwitch,
    errorInsufficientBalance,
  };
};

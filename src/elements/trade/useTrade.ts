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
import { openWalletModal } from 'store/user/user';
import { ApprovalContract } from 'services/web3/approval';
import { ethToken, wethToken } from 'services/web3/config';
import { withdrawWeth } from 'services/web3/swap/limit';
import { addNotification } from 'store/notification/notification';
import { Events } from 'services/api/googleTagManager';
import { sendConversionEvent } from 'services/api/googleTagManager/conversion';

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
}: UseTradeWidgetReturn): UseTradeReturn => {
  const dispatch = useDispatch();
  const slippageTolerance = useAppSelector(
    (state) => state.user.slippageTolerance
  );
  const account = useAppSelector((state) => state.user.account);

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

    await swap(
      isV3,
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

  const [onStart, ApproveModal] = useApproveModal(
    fromInput ? [{ token: fromInput.token, amount: fromInput.inputTkn }] : [],
    handleTrade,
    isV3
      ? ContractsApi.BancorNetwork.contractAddress
      : ApprovalContract.BancorNetwork,
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

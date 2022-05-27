import { useAppSelector } from 'store/index';
import { useMemo, useState } from 'react';
import { useNavigation } from 'hooks/useNavigation';
import { executeSwapTx } from 'services/web3/swap/market';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { toBigNumber } from 'utils/helperFunctions';
import { Token, updateUserBalances } from 'services/observables/tokens';
import { useApproveModal } from 'hooks/useApproveModal';
import { UseTradeWidgetReturn } from 'elements/trade/useTradeWidget';
import { swapNotification } from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { openWalletModal } from 'store/user/user';

export interface UseTradeReturn {
  ApproveModal: JSX.Element;
  isBusy: boolean;
  handleSelectSwitch: () => void;
  errorInsufficientBalance: string | undefined;
  handleSelectTo: (token: Token) => void;
  handleSelectFrom: (token: Token) => void;
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

    try {
      const tx = await executeSwapTx(
        isV3,
        account,
        slippageTolerance,
        fromInput.token,
        toInput.token,
        fromInput.inputTkn,
        toInput.inputTkn
      );
      swapNotification(
        dispatch,
        fromInput.token,
        toInput.token,
        fromInput.inputTkn,
        toInput.inputTkn,
        tx.hash
      );
      setIsBusy(false);
      fromInput.setInputTkn('');
      fromInput.setInputFiat('');
      toInput.setInputTkn('');
      toInput.setInputFiat('');
      await tx.wait();
      await updateUserBalances();
    } catch (e) {
      console.error(e);
      setIsBusy(false);
    }
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
    ContractsApi.BancorNetwork.contractAddress
  );

  const handleSelectFrom = (token: Token) => {
    goToPage.tradeBeta(
      {
        from: token.address,
        to: toInput?.token.address,
      },
      true
    );
  };

  const handleSelectTo = (token: Token) => {
    goToPage.tradeBeta(
      {
        from: fromInput?.token.address,
        to: token.address,
      },
      true
    );
  };

  const handleSelectSwitch = () => {
    goToPage.tradeBeta(
      {
        from: toInput?.token.address,
        to: fromInput?.token.address,
      },
      true
    );
  };

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

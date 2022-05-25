import { useAppSelector } from 'store/index';
import { useMemo, useState } from 'react';
import { useNavigation } from 'hooks/useNavigation';
import { ethToken } from 'services/web3/config';
import { expandToken } from 'utils/formulas';
import { calculateMinimumReturn } from 'services/web3/swap/market';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { getFutureTime, toBigNumber } from 'utils/helperFunctions';
import dayjs from 'utils/dayjs';
import { Token, updateUserBalances } from 'services/observables/tokens';
import { useApproveModal } from 'hooks/useApproveModal';
import { useTokenInputV3Return } from 'elements/trade/useTknFiatInput';

export const useTrade = (
  fromInput?: useTokenInputV3Return,
  toInput?: useTokenInputV3Return
) => {
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
    const fromIsEth = fromInput.token.address === ethToken;
    const fromWei = expandToken(fromInput.inputTkn, fromInput.token.decimals);
    const expectedToWei = expandToken(toInput.inputTkn, toInput.token.decimals);
    const minReturn = calculateMinimumReturn(expectedToWei, slippageTolerance);
    try {
      await ContractsApi.BancorNetwork.write.tradeBySourceAmount(
        fromInput.token.address,
        toInput.token.address,
        fromWei,
        minReturn,
        getFutureTime(dayjs.duration({ days: 7 })),
        account,
        { value: fromIsEth ? fromWei : undefined }
      );
      await updateUserBalances();
      fromInput.setInputTkn('');
      fromInput.setInputFiat('');
      toInput.setInputTkn('');
      toInput.setInputFiat('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCTAClick = () => {
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

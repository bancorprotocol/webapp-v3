import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { Token } from 'services/observables/tokens';
import { useEffect, useState } from 'react';
import { getRateAndPriceImapct, swap } from 'services/web3/swap/market';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { useDispatch } from 'react-redux';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { useWeb3React } from '@web3-react/core';
import { getNetworkContractApproval } from 'services/web3/approval';
import { prettifyNumber } from 'utils/helperFunctions';
import { ethToken, wethToken } from 'services/web3/config';
import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';
import { openWalletModal } from 'redux/user/user';
import { ModalApprove } from 'elements/modalApprove/modalApprove';
import { sanitizeNumberInput } from 'utils/pureFunctions';
interface SwapMarketProps {
  fromToken: Token;
  setFromToken: Function;
  toToken: Token | null;
  setToToken: Function;
  switchTokens: Function;
}

export const SwapMarket = ({
  fromToken,
  setFromToken,
  toToken,
  setToToken,
  switchTokens,
}: SwapMarketProps) => {
  const { chainId, account } = useWeb3React();
  const [fromAmount, setFromAmount] = useState('');
  const [fromDebounce, setFromDebounce] = useDebounce('');
  const [toAmount, setToAmount] = useState('');
  const [toAmountUsd, setToAmountUsd] = useState('');
  const [fromAmountUsd, setFromAmountUsd] = useState('');
  const [rate, setRate] = useState('');
  const [priceImpact, setPriceImpact] = useState('');
  const [fromError, setFromError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [disableSwap, setDisableSwap] = useState(false);
  const [rateToggle, setRateToggle] = useState(false);
  const dispatch = useDispatch();

  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const slippageTolerance = useAppSelector<number>(
    (state) => state.user.slippageTolerance
  );

  useEffect(() => {
    (async () => {
      if (toToken && toToken.address === wethToken) setToToken(undefined);
      else if (fromToken && toToken && fromToken.address !== wethToken) {
        const res = await getRateAndPriceImapct(fromToken, toToken, '1');
        setRate(res.rate);
        setPriceImpact(res.priceImpact);
      }
    })();
  }, [fromToken, toToken, setToToken]);

  useEffect(() => {
    if (fromToken && fromToken.address === wethToken) {
      const eth = tokens.find((x) => x.address === ethToken);
      setRate('1');
      setPriceImpact('0.0000');
      setToToken(eth);
      setToAmount(fromDebounce);
    } else {
      (async () => {
        if (
          (!fromDebounce || !parseFloat(fromDebounce)) &&
          fromToken &&
          toToken
        ) {
          setToAmount('');
          setToAmountUsd('');
          const res = await getRateAndPriceImapct(fromToken, toToken, '1');
          setRate(res.rate);
          setPriceImpact(res.priceImpact);
        } else if (fromToken && toToken) {
          const result = await getRateAndPriceImapct(
            fromToken,
            toToken,
            fromDebounce
          );
          const rate = new BigNumber(result.rate).div(fromDebounce);
          setToAmount(
            sanitizeNumberInput(
              new BigNumber(fromDebounce).times(rate).toString(),
              toToken.decimals
            )
          );
          const usdAmount = new BigNumber(fromDebounce)
            .times(rate)
            .times(toToken.usdPrice!)
            .toString();
          setToAmountUsd(usdAmount);
          setRate(rate.toString());
          setPriceImpact(result.priceImpact);
        }
      })();
    }
  }, [fromToken, toToken, setToToken, fromDebounce, tokens]);

  const usdSlippage = () => {
    if (!toAmountUsd || !fromAmountUsd) return;
    const difference = new BigNumber(toAmountUsd).minus(fromAmountUsd);
    const percentage = new BigNumber(difference)
      .div(fromAmountUsd)
      .times(100)
      .toFixed(2);
    return parseFloat(percentage);
  };

  //Check if approval is required
  const checkApproval = async () => {
    try {
      const isApprovalReq = await getNetworkContractApproval(
        fromToken,
        fromAmount
      );
      if (isApprovalReq) setShowModal(true);
      else await handleSwap(true);
    } catch (e) {
      console.error('getNetworkContractApproval failed', e);
      setDisableSwap(false);
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Check Allowance',
          msg: 'Unkown error - check console log.',
        })
      );
    }
  };

  const handleSwap = async (approved: boolean = false) => {
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }

    if (!(chainId && toToken)) return;

    setDisableSwap(true);
    if (!approved) return checkApproval();

    try {
      const txHash = await swap({
        slippageTolerance,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        user: account,
        onConfirmation,
      });

      dispatch(
        addNotification({
          type: NotificationType.pending,
          title: 'Test Notification',
          msg: 'Some message here...',
          txHash,
        })
      );
    } catch (e) {
      console.error('Swap failed with error: ', e);
      setDisableSwap(false);
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Swap Failed',
          msg: e.message,
        })
      );
    } finally {
      setShowModal(false);
    }
  };

  const onConfirmation = () => {
    setDisableSwap(false);
  };

  const handleSwitch = () => {
    if (!toToken) return;
    switchTokens();
    setFromAmountUsd(
      new BigNumber(fromAmount).times(toToken.usdPrice!).toString()
    );
  };

  // handle input errors
  useEffect(() => {
    const isInsufficient =
      fromToken &&
      fromToken.balance &&
      new BigNumber(fromAmount).gt(fromToken.balance);
    if (isInsufficient) setFromError('Token balance is currently insufficient');
    else setFromError('');
  }, [fromAmount, fromToken]);

  const isSwapDisabled = () => {
    if (fromError !== '') return true;
    if (rate === '0') return true;
    if (disableSwap) return true;
    if (fromAmount === '' || new BigNumber(fromAmount).eq(0)) return true;
    if (!toToken) return true;
    if (!account) return false;
    return false;
  };

  const swapButtonText = () => {
    if (!toToken) return 'Select a token';
    if (fromToken.balance) {
      const isInsufficientBalance = new BigNumber(fromToken.balance).lt(
        fromAmount
      );
      if (isInsufficientBalance) return 'Insufficient balance';
    }
    const isInputZero = fromAmount === '' || new BigNumber(fromAmount).eq(0);
    if (isInputZero) return 'Enter Amount';
    if (rate === '0') return 'Insufficient liquidity';
    if (!account) return 'Connect your wallet';
    const isHighSlippage = new BigNumber(priceImpact).gte(5);
    if (isHighSlippage) return 'Trade with high slippage';
    return 'Trade';
  };

  const buttonVariant = () => {
    const isHighSlippage = new BigNumber(priceImpact).gte(10);
    if (isHighSlippage) return 'btn-error';
    return 'btn-primary';
  };

  return (
    <>
      <div>
        <div className="px-20">
          <TokenInputField
            dataCy="fromAmount"
            label="You Pay"
            token={fromToken}
            setToken={setFromToken}
            input={fromAmount}
            setInput={setFromAmount}
            amountUsd={fromAmountUsd}
            setAmountUsd={setFromAmountUsd}
            debounce={setFromDebounce}
            border
            selectable
            excludedTokens={toToken ? [toToken.address] : []}
            errorMsg={fromError}
          />
        </div>

        <div className="widget-block">
          <button
            onClick={() => fromToken.address !== wethToken && handleSwitch()}
            className="widget-block-icon transform hover:rotate-180 transition duration-500 "
          >
            <IconSync className="w-[25px] text-primary dark:text-primary-light" />
          </button>
          <div className="mx-10 mb-16 pt-16">
            <TokenInputField
              label="You Receive"
              dataCy="toAmount"
              token={toToken}
              setToken={setToToken}
              input={toAmount}
              setInput={setToAmount}
              amountUsd={toAmountUsd}
              setAmountUsd={setToAmountUsd}
              disabled
              selectable={fromToken && fromToken.address !== wethToken}
              startEmpty
              excludedTokens={[fromToken && fromToken.address, wethToken]}
              usdSlippage={usdSlippage()}
            />
            {toToken && (
              <>
                <div className="flex justify-between mt-15">
                  <span>Rate</span>
                  <span
                    className="flex cursor-pointer"
                    onClick={() => setRateToggle(!rateToggle)}
                  >
                    {rateToggle
                      ? `1 ${fromToken?.symbol} = ${prettifyNumber(rate)} ${
                          toToken?.symbol
                        }`
                      : `1 ${toToken?.symbol} = ${prettifyNumber(
                          rate === '0' ? 0 : 1 / Number(rate)
                        )} ${fromToken?.symbol}`}
                    <IconSync className="w-12 ml-[3px]" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact</span>
                  <span
                    data-cy="priceImpact"
                    className={`${
                      new BigNumber(priceImpact).gte(3) ? 'text-error' : ''
                    }`}
                  >
                    {priceImpact}%
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => handleSwap()}
            className={`${buttonVariant()} rounded w-full`}
            disabled={isSwapDisabled()}
          >
            {swapButtonText()}
          </button>
        </div>
      </div>
      <ModalApprove
        isOpen={showModal}
        setIsOpen={setShowModal}
        amount={fromAmount}
        fromToken={fromToken}
        handleApproved={() => handleSwap(true)}
        handleCatch={() => setDisableSwap(false)}
      />
    </>
  );
};

import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { Tooltip } from 'components/tooltip/Tooltip';
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
import {
  ApprovalContract,
  getNetworkContractApproval,
} from 'services/web3/approval';
import { prettifyNumber } from 'utils/helperFunctions';
import { ethToken, wethToken } from 'services/web3/config';
import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';
import { openWalletModal } from 'redux/user/user';
import { ModalApprove } from 'elements/modalApprove/modalApprove';
import { sanitizeNumberInput } from 'utils/pureFunctions';
import {
  sendConversionEvent,
  ConversionEvents,
} from 'services/api/googleTagManager';
import { EthNetworks } from 'services/web3/types';
import { withdrawWeth } from 'services/web3/swap/limit';
import { updateTokens } from 'redux/bancor/bancor';
import { fetchTokenBalances } from 'services/observables/balances';
import { wait } from 'utils/pureFunctions';
import { getConversionLS, setConversionLS } from 'utils/localStorage';
import { useInterval } from 'hooks/useInterval';
import {
  rejectNotification,
  swapFailedNotification,
  swapNotification,
} from 'services/notifications/notifications';
import { useAsyncEffect } from 'use-async-effect';

interface SwapMarketProps {
  fromToken: Token;
  setFromToken: Function;
  toToken?: Token;
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
  const [rateToggle, setRateToggle] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);

  const dispatch = useDispatch();

  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const slippageTolerance = useAppSelector<number>(
    (state) => state.user.slippageTolerance
  );

  const loadRateAndPriceImapct = async (
    fromToken: Token,
    toToken: Token,
    amount: string,
    showAnimation = true
  ) => {
    if (showAnimation) setIsLoadingRate(true);
    const res = await getRateAndPriceImapct(fromToken, toToken, amount);
    if (showAnimation) setIsLoadingRate(false);
    return res;
  };

  useInterval(() => {
    if (toToken && fromToken.address !== wethToken) {
      loadRateAndPriceImapct(
        fromToken,
        toToken,
        fromAmount ? fromAmount : '1',
        false
      );
    }
  }, 15000);

  useEffect(() => {
    setIsLoadingRate(true);
  }, [fromAmount]);

  useEffect(() => {
    if (fromToken && fromToken.address === wethToken) {
      const eth = tokens.find((x) => x.address === ethToken);
      setRate('1');
      setPriceImpact('0.00');
      const usdAmount = new BigNumber(fromDebounce)
        .times(1)
        .times(eth?.usdPrice!)
        .toString();
      setToAmountUsd(usdAmount);
      setToAmount(fromDebounce);
      setIsLoadingRate(false);
    }
  }, [fromDebounce, fromToken, toToken, tokens]);

  useAsyncEffect(
    async (isMounted) => {
      if (isMounted() && fromToken && fromToken.address !== wethToken) {
        if (
          (!fromDebounce || !parseFloat(fromDebounce)) &&
          fromToken &&
          toToken
        ) {
          setToAmount('');
          setToAmountUsd('');
          const res = await loadRateAndPriceImapct(fromToken, toToken, '1');
          setRate(res.rate);
          if (fromDebounce) setPriceImpact(res.priceImpact);
          else setPriceImpact('0.00');
        } else if (fromToken && toToken) {
          const result = await loadRateAndPriceImapct(
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
          if (fromDebounce) setPriceImpact(result.priceImpact);
          else setPriceImpact('0.00');
        }
      }
    },
    [fromToken?.address, toToken?.address, fromDebounce]
  );

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
        ApprovalContract.BancorNetwork,
        fromAmount
      );
      if (isApprovalReq) {
        const conversion = getConversionLS();
        sendConversionEvent(ConversionEvents.approvePop, conversion);
        setShowModal(true);
      } else await handleSwap(true);
    } catch (e: any) {
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Transaction Failed',
          msg: `${fromToken.symbol} approval had failed. Please try again or contact support.`,
        })
      );
    }
  };

  const onConfirmation = async () => {
    if (!(chainId && toToken && account)) return;

    await wait(4000);
    const balances = await fetchTokenBalances([fromToken, toToken], account);
    dispatch(updateTokens(balances));
  };

  const handleSwap = async (approved: boolean = false) => {
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }

    if (!(chainId && toToken)) return;

    if (!approved) return checkApproval();

    if (fromToken.address === wethToken) {
      dispatch(addNotification(await withdrawWeth(fromAmount)));
      return;
    }

    const conversion = getConversionLS();
    await swap(
      slippageTolerance,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      (txHash: string) =>
        swapNotification(
          dispatch,
          fromToken,
          toToken,
          fromAmount,
          toAmount,
          txHash
        ),
      () => {
        sendConversionEvent(ConversionEvents.success, {
          ...conversion,
          conversion_market_token_rate: fromToken.usdPrice,
          transaction_category: 'Conversion',
        });
        onConfirmation();
      },
      () => rejectNotification(dispatch),
      (error: string) => {
        sendConversionEvent(ConversionEvents.fail, {
          conversion,
          error,
        });
        swapFailedNotification(
          dispatch,
          fromToken,
          toToken,
          fromAmount,
          toAmount
        );
      }
    );

    setShowModal(false);
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
    if (isLoadingRate) return true;
    if (fromError !== '') return true;
    if (rate === '0') return true;
    if (fromAmount === '' || new BigNumber(fromAmount).eq(0)) return true;
    if (!toToken) return true;
    if (toToken.address === wethToken) return true;
    if (!account) return false;
    return false;
  };

  const swapButtonText = () => {
    if (!toToken) return 'Select a token';
    else if (toToken.address === wethToken) return 'Please change WETH to ETH';
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
          <div className="widget-block-icon cursor-pointer">
            <IconSync
              className="transform hover:rotate-180 transition duration-500 w-[25px] text-primary dark:text-primary-light"
              onClick={() => fromToken.address !== wethToken && handleSwitch()}
            />
          </div>
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
              isLoading={isLoadingRate}
            />
            {toToken && (
              <>
                <div className="flex justify-between items-center mt-15">
                  <span>Rate</span>
                  {isLoadingRate ? (
                    <div className="loading-skeleton h-10 w-[140px]"></div>
                  ) : (
                    <button
                      className="flex items-center"
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
                    </button>
                  )}
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="mr-5">Price Impact</span>
                    <Tooltip content="The difference between market price and estimated price due to trade size" />
                  </div>
                  {isLoadingRate ? (
                    <div className="loading-skeleton h-10 w-[80px]"></div>
                  ) : (
                    <span
                      data-cy="priceImpact"
                      className={`${
                        new BigNumber(priceImpact).gte(3) ? 'text-error' : ''
                      }`}
                    >
                      {priceImpact}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => {
              const conversion = {
                conversion_type: 'Market',
                conversion_blockchain_network:
                  chainId === EthNetworks.Ropsten ? 'Ropsten' : 'MainNet',
                conversion_settings:
                  slippageTolerance === 0.005 ? 'Regular' : 'Advanced',
                conversion_token_pair: fromToken.symbol + '/' + toToken?.symbol,
                conversion_from_token: fromToken.symbol,
                conversion_to_token: toToken?.symbol,
                conversion_from_amount: fromAmount,
                conversion_from_amount_usd: fromAmountUsd,
                conversion_to_amount: toAmount,
                conversion_to_amount_usd: toAmountUsd,
                conversion_input_type: fiatToggle ? 'Fiat' : 'Token',
                conversion_rate: rate,
              };
              setConversionLS(conversion);
              sendConversionEvent(ConversionEvents.click, conversion);
              handleSwap();
            }}
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
        waitForApproval={true}
        contract={ApprovalContract.BancorNetwork}
      />
    </>
  );
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'utils/dayjs';
import BigNumber from 'bignumber.js';
import { InputField } from 'components/inputField/InputField';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { ModalDuration } from 'elements/modalDuration/modalDuration';
import { Token } from 'services/observables/tokens';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { useInterval } from 'hooks/useInterval';
import { getRate } from 'services/web3/swap/market';
import { KeeprDaoToken, swapLimit } from 'services/api/keeperDao';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { ethToken, wethToken } from 'services/web3/config';
import { useAppSelector } from 'redux/index';
import { openWalletModal } from 'redux/user/user';
import { ModalApprove } from 'elements/modalApprove/modalApprove';
import {
  ApprovalContract,
  getNetworkContractApproval,
} from 'services/web3/approval';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  sendConversionEvent,
  ConversionEvents,
} from 'services/api/googleTagManager';
import { EthNetworks } from 'services/web3/types';
import { updateTokens } from 'redux/bancor/bancor';
import { fetchTokenBalances } from 'services/observables/balances';
import { wait } from 'utils/pureFunctions';
import { getConversionLS, setConversionLS } from 'utils/localStorage';
import { calculatePercentageChange } from 'utils/formulas';
import { ModalDepositETH } from 'elements/modalDepositETH/modalDepositETH';

enum Field {
  from,
  to,
  rate,
}

interface SwapLimitProps {
  fromToken: Token;
  setFromToken: Function;
  toToken?: Token;
  setToToken: Function;
  switchTokens: Function;
}

export const SwapLimit = ({
  fromToken,
  setFromToken,
  toToken,
  setToToken,
  switchTokens,
}: SwapLimitProps) => {
  const dispatch = useDispatch();
  const { account, chainId } = useWeb3React();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [toAmountUsd, setToAmountUsd] = useState('');
  const [fromAmountUsd, setFromAmountUsd] = useState('');
  const [rate, setRate] = useState('');
  const [marketRate, setMarketRate] = useState(-1);
  const [percentage, setPercentage] = useState('');
  const [selPercentage, setSelPercentage] = useState(1);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showEthModal, setShowEthModal] = useState(false);
  const [fromError, setFromError] = useState('');
  const [rateWarning, setRateWarning] = useState({ type: '', msg: '' });
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [duration, setDuration] = useState(
    dayjs.duration({ days: 7, hours: 0, minutes: 0 })
  );

  const previousField = useRef<Field>();
  const lastChangedField = useRef<Field>();
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const keeperDaoTokens = useAppSelector<KeeprDaoToken[]>(
    (state) => state.bancor.keeperDaoTokens
  );
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);
  const percentages = useMemo(() => [1, 3, 5], []);

  useInterval(() => {
    fetchMarketRate(false);
  }, 15000);

  const calculatePercentageByRate = useCallback(
    (marketRate: number, rate: string) => {
      const percentage = calculatePercentageChange(Number(rate), marketRate);
      const index = percentages.indexOf(percentage);
      if (index === -1) setPercentage(percentage.toFixed(2));
      else {
        setPercentage('');
        setSelPercentage(index);
      }
    },
    [percentages]
  );

  const calcFrom = useCallback(
    (to: string, rate: string) => {
      if (rate && to) {
        const amount = new BigNumber(to).div(rate);
        setFromAmount(amount.toString());
        const usdAmount = amount.times(fromToken!.usdPrice!).toString();
        setFromAmountUsd(usdAmount);
      }
    },
    [fromToken]
  );
  const calcTo = useCallback(
    (from: string, rate: string) => {
      if (rate && from && toToken) {
        const amount = new BigNumber(rate).times(from);
        setToAmount(amount.toString());
        const usdAmount = amount.times(toToken.usdPrice!).toString();
        setToAmountUsd(usdAmount);
      }
    },
    [toToken]
  );
  const calcRate = useCallback(
    (from: string, to: string) => {
      if (from && to) {
        const rate = new BigNumber(to).div(from).toString();
        setRate(rate);
        calculatePercentageByRate(marketRate, rate);
      }
    },
    [calculatePercentageByRate, marketRate]
  );

  const handleFieldChanged = useCallback(
    (field: Field, from: string, to: string, rate: string) => {
      if (
        previousField.current !== lastChangedField.current &&
        lastChangedField.current !== field
      )
        previousField.current = lastChangedField.current;
      lastChangedField.current = field;

      switch (field) {
        case Field.from:
          if (previousField.current === Field.to) calcRate(from, to);
          else calcTo(from, rate);
          break;
        case Field.to:
          if (previousField.current === Field.from) calcRate(from, to);
          else calcFrom(to, rate);
          break;
        case Field.rate:
          const isTooHigh = new BigNumber(rate).lt(marketRate);
          const isTooLow = new BigNumber(marketRate).times(1.2).lt(rate);
          if (isTooHigh) {
            setRateWarning({
              type: 'error',
              msg: 'Pay attention! The rate is lower than market rate, you can get a better rate on market swap',
            });
          } else if (isTooLow) {
            setRateWarning({
              type: 'warning',
              msg: 'Pay attention! The rate is too high above market rate and will likely not be fulfilled',
            });
          } else {
            setRateWarning({
              type: '',
              msg: '',
            });
          }
          if (previousField.current === Field.from) calcTo(from, rate);
          else calcFrom(to, rate);
          break;
      }
    },
    [calcRate, calcTo, calcFrom, marketRate]
  );

  const calculateRateByMarket = useCallback(
    (marketRate: number, selPercentage: number, percentage: string) => {
      const perc =
        selPercentage === -1
          ? Number(percentage) / 100
          : percentages[selPercentage] / 100;
      const rate = (marketRate * (1 + perc)).toFixed(6);
      handleFieldChanged(Field.rate, fromAmount, toAmount, rate);
      setRate(rate);
    },
    [percentages, fromAmount, toAmount, handleFieldChanged]
  );

  const fetchMarketRate = useCallback(
    async (setLoading = true) => {
      if (!fromToken || !toToken) return;
      if (toToken.address === ethToken && fromToken.address === wethToken)
        return;

      setIsLoadingRate(setLoading);
      const rate = await getRate(fromToken, toToken, '1');
      setMarketRate(Number(rate));
      setIsLoadingRate(false);
    },
    [fromToken, toToken]
  );

  useEffect(() => {
    calculateRateByMarket(marketRate, selPercentage, percentage);
    // eslint-disable-next-line
  }, [calculateRateByMarket, fromToken, toToken]);

  useEffect(() => {
    fetchMarketRate();
  }, [fetchMarketRate, fromToken, toToken]);

  //Check if approval is required
  const checkApproval = async (token: Token) => {
    try {
      const isApprovalReq = await getNetworkContractApproval(
        token,
        ApprovalContract.ExchangeProxy,
        fromAmount
      );
      if (isApprovalReq) {
        const conversion = getConversionLS();
        sendConversionEvent(ConversionEvents.approvePop, conversion);
        setShowApproveModal(true);
      } else await handleSwap(true, token.address === wethToken);
    } catch (e: any) {
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Transaction Failed',
          msg: `${token.symbol} approval had failed. Please try again or contact support.`,
        })
      );
    }
  };

  const updateETHandWETH = async () => {
    if (!(chainId && toToken && account)) return;

    const weth = tokens.find((x) => x.address === wethToken);
    await wait(4000);
    const balances = await fetchTokenBalances(
      weth ? [fromToken, weth] : [fromToken],
      account
    );
    dispatch(updateTokens(balances));
  };

  const handleSwap = async (
    approved: boolean = false,
    weth: boolean = false,
    showETHtoWETHModal: boolean = false
  ) => {
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }

    if (!(fromToken && toToken && fromAmount && toAmount)) return;

    if (showETHtoWETHModal) return setShowEthModal(true);

    if (!approved) return checkApproval(fromToken);

    const notification = await swapLimit(
      weth ? { ...fromToken, address: wethToken } : fromToken,
      toToken,
      fromAmount,
      toAmount,
      account,
      duration,
      checkApproval
    );

    if (notification) dispatch(addNotification(notification));
    if (fromToken.address === ethToken) updateETHandWETH();
  };

  const isSwapDisabled = () => {
    if (isLoadingRate) return true;
    if (fromError !== '') return true;
    if (
      fromAmount === '' ||
      toAmount === '' ||
      rate === '' ||
      new BigNumber(fromAmount).eq(0) ||
      new BigNumber(toAmount).eq(0) ||
      new BigNumber(rate).eq(0)
    )
      return true;
    if (!toToken) return true;
    if (!account) return false;
    if (
      toToken.address === ethToken ||
      keeperDaoTokens.findIndex((x) => x.address === toToken.address) === -1 ||
      (fromToken.address !== ethToken &&
        keeperDaoTokens.findIndex((x) => x.address === fromToken.address) ===
          -1)
    )
      return true;

    return false;
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

  const handleRateInput = (val: string) => {
    setRate(val);
    calculatePercentageByRate(marketRate, val);
    handleFieldChanged(Field.rate, fromAmount, toAmount, val);
  };

  const swapButtonText = () => {
    if (!toToken) return 'Select a token';
    else if (
      fromToken.address !== ethToken &&
      keeperDaoTokens.findIndex((x) => x.address === fromToken.address) === -1
    )
      return `${fromToken.symbol} token is not supported`;
    if (toToken.address === ethToken) return 'Please change ETH to WETH';
    else if (
      keeperDaoTokens.findIndex((x) => x.address === toToken.address) === -1
    )
      return `${toToken.symbol} token is not supported`;

    return 'Trade';
  };

  return (
    <div>
      <div className="px-20">
        <TokenInputField
          label="You Pay"
          token={fromToken}
          setToken={setFromToken}
          input={fromAmount}
          amountUsd={fromAmountUsd}
          setAmountUsd={setFromAmountUsd}
          onChange={(val: string) => {
            setFromAmount(val);
            handleFieldChanged(Field.from, val, toAmount, rate);
          }}
          border
          selectable
          excludedTokens={
            toToken
              ? [
                  toToken.address,
                  ...(toToken.address === ethToken ||
                  toToken.address === wethToken
                    ? [ethToken, wethToken]
                    : []),
                ]
              : []
          }
          errorMsg={fromError}
          includedTokens={[ethToken, ...keeperDaoTokens.map((x) => x.address)]}
        />
      </div>

      <div className="widget-block">
        <div className="widget-block-icon cursor-pointer">
          <IconSync
            className="transform hover:rotate-180 transition duration-500 w-[25px] text-primary dark:text-primary-light"
            onClick={() => switchTokens()}
          />
        </div>
        <div className="mx-10 mb-16 pt-16">
          <TokenInputField
            label="You Receive"
            token={toToken}
            setToken={setToToken}
            input={toAmount}
            amountUsd={toAmountUsd}
            setAmountUsd={setToAmountUsd}
            onChange={(val: string) => {
              setToAmount(val);
              handleFieldChanged(Field.to, fromAmount, val, rate);
            }}
            selectable
            startEmpty
            excludedTokens={
              fromToken
                ? [
                    fromToken.address,
                    ...(fromToken.address === ethToken ||
                    fromToken.address === wethToken
                      ? [ethToken, wethToken]
                      : []),
                  ]
                : []
            }
            includedTokens={keeperDaoTokens.map((x) => x.address)}
          />
          {toToken && (
            <>
              <div className="flex justify-between items-center mt-28 mb-2 pr-10">
                <div className="font-medium">Rate</div>
                {isLoadingRate ? (
                  <div className="loading-skeleton h-10 w-[190px]"></div>
                ) : (
                  <div className="text-12">
                    Market Rate:{' '}
                    {`1 ${fromToken?.symbol} = ${prettifyNumber(marketRate)} ${
                      toToken?.symbol
                    }`}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="whitespace-nowrap text-20 min-w-[135px]">{`1 ${fromToken?.symbol} =`}</div>
                <div className="relative w-full">
                  {isLoadingRate && (
                    <div className="absolute flex justify-end bottom-[17px] bg-white dark:bg-blue-4 h-[21px] w-full pr-15">
                      <div className="loading-skeleton h-[24px] w-4/5"></div>
                    </div>
                  )}
                  <InputField format input={rate} onChange={handleRateInput} />
                </div>
              </div>
              {rateWarning.msg && marketRate !== -1 && (
                <div className="flex mt-10">
                  <div className="min-w-[135px]"></div>
                  <div
                    className={`mx-8 text-center text-10 sm:text-12 font-light ${classNameGenerator(
                      {
                        'text-error': rateWarning.type === 'error',
                        'text-warning': rateWarning.type === 'warning',
                      }
                    )}`}
                  >
                    {rateWarning.msg}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-8 mt-15">
                {percentages.map((slip, index) => (
                  <button
                    key={'slippage' + slip}
                    className={`btn-sm rounded-10 h-[34px] text-14 ${classNameGenerator(
                      {
                        'btn-outline-secondary': selPercentage !== index,
                        'btn-primary': selPercentage === index,
                      }
                    )} bg-opacity-0`}
                    onClick={() => {
                      calculateRateByMarket(marketRate, index, '');
                      setSelPercentage(index);
                      setPercentage('');
                    }}
                  >
                    +{slip}%
                  </button>
                ))}
                <div className="w-[70px]">
                  <InputField
                    input={percentage}
                    onBlur={() => {
                      const percNum = Number(percentage);
                      const index = percentages.indexOf(percNum);
                      if (index !== -1 || !percNum) setPercentage('');

                      const sel = percNum
                        ? index
                        : selPercentage === -1
                        ? 1
                        : selPercentage;
                      calculateRateByMarket(marketRate, sel, percentage);
                      setSelPercentage(sel);
                    }}
                    onChange={(val: string) => {
                      calculateRateByMarket(marketRate, -1, val);
                      setPercentage(val);
                    }}
                    format
                    placeholder="Custom"
                    customClass="text-14 py-6 rounded-10 bg-opacity-0 border border-grey-3 p-6"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-15">
                <span className="font-semibold">Expires in</span>
                <ModalDuration duration={duration} setDuration={setDuration} />
              </div>
            </>
          )}
        </div>

        <ModalApprove
          isOpen={showApproveModal}
          setIsOpen={setShowApproveModal}
          amount={fromAmount}
          fromToken={
            fromToken?.address === ethToken
              ? { ...fromToken, symbol: 'WETH', address: wethToken }
              : fromToken
          }
          handleApproved={() =>
            handleSwap(true, fromToken.address === ethToken)
          }
          contract={ApprovalContract.ExchangeProxy}
        />
        <ModalDepositETH
          amount={fromAmount}
          setIsOpen={setShowEthModal}
          isOpen={showEthModal}
          onConfirm={() => handleSwap(true)}
        />
        <button
          className="btn-primary rounded w-full"
          onClick={() => {
            const conversion = {
              conversion_type: 'Limit',
              conversion_blockchain_network:
                chainId === EthNetworks.Ropsten ? 'Ropsten' : 'MainNet',
              conversion_token_pair: fromToken.symbol + '/' + toToken?.symbol,
              conversion_from_token: fromToken.symbol,
              conversion_to_token: toToken?.symbol,
              conversion_from_amount: fromAmount,
              conversion_from_amount_usd: fromAmountUsd,
              conversion_to_amount: toAmount,
              conversion_to_amount_usd: toAmountUsd,
              conversion_input_type: fiatToggle ? 'Fiat' : 'Token',
              conversion_rate: rate,
              conversion_rate_percentage:
                selPercentage === -1
                  ? percentage
                  : percentages[selPercentage].toFixed(0),
              conversion_experation: duration.asSeconds().toString(),
            };
            setConversionLS(conversion);
            sendConversionEvent(ConversionEvents.click, conversion);
            handleSwap(false, false, fromToken.address === ethToken);
          }}
          disabled={isSwapDisabled()}
        >
          {swapButtonText()}
        </button>
      </div>
    </div>
  );
};

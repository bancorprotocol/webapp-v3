import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'utils/dayjs';
import BigNumber from 'bignumber.js';
import { InputField } from 'components/inputField/InputField';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { TokenMinimal, updateUserBalances } from 'services/observables/tokens';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { getRate } from 'services/web3/swap/market';
import { KeeprDaoToken, swapLimit } from 'services/api/keeperDao';
import { useDispatch } from 'react-redux';
import { ethToken, wethToken } from 'services/web3/config';
import { useAppSelector } from 'store';
import { ApprovalContract } from 'services/web3/approval';
import { formatDuration, prettifyNumber } from 'utils/helperFunctions';
import { calculatePercentageChange } from 'utils/formulas';
import {
  Button,
  ButtonPercentages,
  ButtonSize,
} from 'components/button/Button';
import useAsyncEffect from 'use-async-effect';
import { useWalletConnect } from 'elements/walletConnect/useWalletConnect';
import { useApproval } from 'hooks/useApproval';
import {
  depositETHNotification,
  rejectNotification,
  swapLimitFailedNotification,
  swapLimitNotification,
} from 'services/notifications/notifications';
import { depositWeth } from 'services/web3/swap/limit';
import { ErrorCode } from 'services/web3/types';
import {
  setCurrentConversion,
  sendConversionEvent,
} from 'services/api/googleTagManager/conversion';
import { useModal } from 'hooks/useModal';
import { ModalNames } from 'modals';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { TokenCurrency } from 'store/user/user';
import { Events } from 'services/api/googleTagManager';

enum Field {
  from,
  to,
  rate,
}

interface SwapLimitProps {
  fromToken: TokenMinimal;
  setFromToken: Function;
  toToken?: TokenMinimal;
  setToToken: Function;
  switchTokens: Function;
  refreshLimit: Function;
}

export const SwapLimit = ({
  fromToken,
  setFromToken,
  toToken,
  setToToken,
  switchTokens,
  refreshLimit,
}: SwapLimitProps) => {
  const dispatch = useDispatch();
  const { pushModal } = useModal();
  const account = useAppSelector((state) => state.user.account);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [toAmountUsd, setToAmountUsd] = useState('');
  const [fromAmountUsd, setFromAmountUsd] = useState('');
  const [rate, setRate] = useState('');
  const [marketRate, setMarketRate] = useState(-1);
  const [percentage, setPercentage] = useState('');
  const [selPercentage, setSelPercentage] = useState(1);
  const [fromError, setFromError] = useState('');
  const [rateWarning, setRateWarning] = useState({ type: '', msg: '' });
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [duration, setDuration] = useState(
    dayjs.duration({ days: 7, hours: 0, minutes: 0 })
  );
  const { handleWalletButtonClick } = useWalletConnect();

  const previousField = useRef<Field>();
  const lastChangedField = useRef<Field>();
  const keeperDaoTokens = useAppSelector<KeeprDaoToken[]>(
    (state) => state.bancor.keeperDaoTokens
  );
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;
  const percentages = useMemo(() => [1, 3, 5], []);

  const calculatePercentageByRate = useCallback(
    (marketRate: number, rate: string) => {
      const percentage = calculatePercentageChange(Number(rate), marketRate);
      const index = percentages.indexOf(percentage);
      if (index === -1) {
        setPercentage(percentage.toFixed(2));
        setSelPercentage(-1);
      } else {
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

  const calculateRateByMarket = (
    marketRate: number,
    selPercentage: number,
    percentage: string
  ) => {
    const perc =
      selPercentage === -1
        ? Number(percentage) / 100
        : percentages[selPercentage] / 100;
    const rate = (marketRate * (1 + perc)).toFixed(6);
    handleFieldChanged(Field.rate, fromAmount, toAmount, rate);
    setRate(rate);
  };

  useAsyncEffect(
    async (isMounted) => {
      if (!fromToken || !toToken) return;
      if (toToken.address === ethToken && fromToken.address === wethToken)
        return;

      if (isMounted()) {
        setIsLoadingRate(true);
        const rate = Number(await getRate(fromToken, toToken, '1'));
        setMarketRate(rate);
        calculateRateByMarket(rate, 1, '');
        setIsLoadingRate(false);
        setRateWarning({
          type: '',
          msg: '',
        });
      }
    },
    [toToken?.address, fromToken?.address]
  );

  const updateETHandWETH = async () => {
    if (!(toToken && account)) return;

    setFromAmount('');
    setFromAmountUsd('');

    await updateUserBalances();
  };

  const handleSwap = async () => {
    if (!account) {
      handleWalletButtonClick();
      return;
    }

    if (!(fromToken && toToken && fromAmount && toAmount)) return;

    const tokenPair = fromToken.symbol + '/' + toToken?.symbol;
    setCurrentConversion(
      'Limit',
      tokenPair,
      fromToken.symbol,
      toToken?.symbol,
      fromAmount,
      fromAmountUsd,
      toAmount,
      toAmountUsd,
      isCurrency,
      rate,
      percentage,
      duration.asSeconds().toString()
    );
    sendConversionEvent(Events.click);

    await swapLimit(
      fromToken.address === ethToken
        ? { ...fromToken, address: wethToken }
        : fromToken,
      toToken,
      fromAmount,
      toAmount,
      account,
      duration,
      () => sendConversionEvent(Events.wallet_req),
      () => {
        swapLimitNotification(
          dispatch,
          fromToken,
          toToken,
          fromAmount,
          toAmount
        );
        if (fromToken.address === ethToken) updateETHandWETH();
        refreshLimit();
      },
      () => rejectNotification(dispatch),
      () =>
        swapLimitFailedNotification(
          dispatch,
          fromToken,
          toToken,
          fromAmount,
          toAmount
        )
    );
  };

  const deposiEthWeth = async () => {
    try {
      const txHash = await depositWeth(fromAmount);
      depositETHNotification(dispatch, fromAmount, txHash);
      startWETHApprove();
    } catch (e: any) {
      if (e.code === ErrorCode.DeniedTx)
        sendConversionEvent(
          Events.fail,
          undefined,
          undefined,
          'User rejected transaction'
        );
      else sendConversionEvent(Events.fail, undefined, undefined, e.message);
    }
  };

  const isSwapDisabled = () => {
    if (isLoadingRate) return true;
    if (fromError !== '') return true;
    const isInputZero =
      fromAmount === '' ||
      toAmount === '' ||
      rate === '' ||
      new BigNumber(fromAmount).eq(0) ||
      new BigNumber(toAmount).eq(0) ||
      new BigNumber(rate).eq(0);
    if (isInputZero && account) return true;
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
    if (!account) return 'Connect your wallet';
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

  const startApprove = useApproval(
    [{ amount: fromAmount, token: fromToken }],
    handleSwap,
    ApprovalContract.ExchangeProxy
  );

  const startWETHApprove = useApproval(
    [
      {
        amount: fromAmount,
        token: { ...fromToken, symbol: 'WETH', address: wethToken },
      },
    ],
    handleSwap,
    ApprovalContract.ExchangeProxy
  );

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
          v3AndV2
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
            v3AndV2
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
                    <div className="absolute flex justify-end bottom-[17px] bg-white dark:bg-charcoal h-[21px] w-full pr-15">
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
                <ButtonPercentages
                  percentages={percentages}
                  selected={selPercentage}
                  onClick={(percentage: number) => {
                    const index = percentages.indexOf(percentage);
                    calculateRateByMarket(marketRate, index, '');
                    setSelPercentage(index);
                    setPercentage('');
                  }}
                  itemStyle="w-[70px]"
                />
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
                    customClass="text-14 py-6 rounded-[12px] border border-graphite dark:border-white-low dark:bg-grey p-6"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-15">
                <span className="font-semibold">Expires in</span>
                <button
                  onClick={() =>
                    pushModal({
                      modalName: ModalNames.Duration,
                      data: { duration, setDuration },
                    })
                  }
                  className="flex items-center bg-white dark:bg-charcoal rounded-10 px-40 py-8"
                >
                  {formatDuration(duration)}
                  <IconChevronDown className="w-10 ml-10" />
                </button>
              </div>
            </>
          )}
        </div>

        <Button
          size={ButtonSize.Full}
          onClick={() => {
            if (fromToken.address === ethToken)
              pushModal({
                modalName: ModalNames.DepositETH,
                data: { onConfirm: deposiEthWeth(), amount: fromAmount },
              });
            else startApprove();
          }}
          disabled={isSwapDisabled()}
          className="disabled:bg-silver dark:disabled:bg-charcoal"
        >
          {swapButtonText()}
        </Button>
      </div>
    </div>
  );
};

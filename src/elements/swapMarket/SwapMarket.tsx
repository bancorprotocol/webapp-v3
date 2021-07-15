import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { TokenListItem } from 'services/observables/tokens';
import { useEffect, useState } from 'react';
import { getPriceImpact, getRate, swap } from 'services/web3/swap/methods';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { ReactComponent as IconLock } from 'assets/icons/lock.svg';
import { useDispatch } from 'react-redux';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { useWeb3React } from '@web3-react/core';
import { Modal } from 'components/modal/Modal';
import {
  getNetworkContractApproval,
  setNetworkContractApproval,
} from 'services/web3/approval';
import { prettifyNumber } from 'utils/helperFunctions';
import { ethToken, wethToken } from 'services/web3/config';
import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';
import { openWalletModal } from 'redux/user/user';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { sanitizeNumberInput } from 'utils/pureFunctions';

interface SwapMarketProps {
  fromToken: TokenListItem;
  setFromToken: Function;
  toToken: TokenListItem | null;
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
  const dispatch = useDispatch();

  const { chainId, account } = useWeb3React();
  const [fromAmount, setFromAmount] = useState('');
  const [fromDebounce, setFromDebounce] = useDebounce('');
  const [toAmount, setToAmount] = useState('');
  const [toAmountUsd, setToAmountUsd] = useState('');
  const [fromAmountUsd, setFromAmountUsd] = useState('');
  const [rate, setRate] = useState('');
  const [priceImpact, setPriceImpact] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0);
  const [fromError, setFromError] = useState('');

  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancor.tokens
  );

  useEffect(() => {
    (async () => {
      if (toToken && toToken.address === wethToken) setToToken(undefined);
      else if (fromToken && toToken && fromToken.address !== wethToken) {
        const baseRate = await getRate(fromToken, toToken, '1');
        setRate(baseRate);

        const priceImpact = await getPriceImpact(fromToken, toToken, '1');
        setPriceImpact(priceImpact.toFixed(4));
      }
    })();
  }, [fromToken, toToken, setToToken]);

  useEffect(() => {
    if (fromToken && fromToken.address === wethToken) {
      const eth = tokens.find(
        (x) => x.address.toLowerCase() === ethToken.toLowerCase()
      );
      setRate('1');
      setPriceImpact('0.0000');
      setToToken(eth);
      setToAmount(fromDebounce);
    } else {
      (async () => {
        if (!fromDebounce && fromToken && toToken) {
          setToAmount('');
          setToAmountUsd('');
          const baseRate = await getRate(fromToken, toToken, '1');
          setRate(baseRate);

          const priceImpact = await getPriceImpact(fromToken, toToken, '1');
          setPriceImpact(priceImpact.toFixed(4));
        } else if (fromToken && toToken) {
          const result = await getRate(fromToken, toToken, fromDebounce);
          const rate = new BigNumber(result).div(fromDebounce);
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

          const priceImpact = await getPriceImpact(
            fromToken,
            toToken,
            fromDebounce
          );
          setPriceImpact(priceImpact.toFixed(4));
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

  const closeModal = () => {
    setStep(0);
    setShowModal(false);
  };

  // Step 0 Check allowance
  const checkAllowance = async () => {
    try {
      const isApprovalReq = await getNetworkContractApproval(
        fromToken,
        fromAmount
      );
      if (isApprovalReq) return setStep(1);
      setStep(3);
      await handleSwap(3);
    } catch (e) {
      console.error('getNetworkContractApproval failed', e);
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Check Allowance',
          msg: 'Unkown error - check console log.',
        })
      );
    }
  };

  // Step 1 Wait for user to choose approval
  // Step 2 Proceed with approval based on user selection
  // Prop amount is UNDEFINED when UNLIMITED
  const approveToken = async (amount?: string) => {
    setStep(2);
    try {
      const txHash = await setNetworkContractApproval(fromToken, amount);
      setStep(3);

      dispatch(
        addNotification({
          type: NotificationType.success,
          title: `Approve ${fromToken.symbol}`,
          msg: `${amount || 'Unlimited'} Swap approval set for ${
            fromToken.symbol
          }.`,
          txHash,
        })
      );
      await handleSwap(3);
    } catch (e) {
      console.error('setNetworkContractApproval failed', e);
      closeModal();
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Approve Token',
          msg: 'Unkown error - check console log.',
        })
      );
    }
  };

  const handleSwap = async (step = 0) => {
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }

    if (!(chainId && toToken)) return;

    setShowModal(true);
    if (step < 3) return checkAllowance();
    try {
      const txHash = await swap({
        net: chainId,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        user: account,
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
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Swap Failed',
          msg: e.message,
        })
      );
    } finally {
      closeModal();
    }
  };

  const steps = [
    'Checking allowance ...',
    'Choose approval',
    'Setting approval amount ...',
    'Processing Swap ...',
  ];

  // handle input errors
  useEffect(() => {
    const isInsufficient =
      fromToken &&
      fromToken.balance &&
      new BigNumber(fromAmount).gt(fromToken.balance);
    if (isInsufficient)
      setFromError('Alert: Token balance is currently insufficient');
    else setFromError('');
  }, [fromAmount, fromToken]);

  return (
    <>
      <div>
        <div className="px-20">
          <TokenInputField
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
              className="w-[25px] text-primary dark:text-primary-light"
              onClick={() => fromToken.address !== wethToken && switchTokens()}
            />
          </div>
          <div className="mx-10 mb-16 pt-16">
            <TokenInputField
              label="You Receive"
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
                  <span>
                    1 {fromToken?.symbol} = {prettifyNumber(rate)}{' '}
                    {toToken?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact</span>
                  <span>{priceImpact}%</span>
                </div>{' '}
              </>
            )}
          </div>

          <button
            onClick={() => handleSwap()}
            className="btn-primary rounded w-full"
            disabled={fromError !== ''}
          >
            Swap
          </button>
        </div>
      </div>
      <Modal title={'Swap'} setIsOpen={closeModal} isOpen={showModal}>
        <div className="px-20 pb-20">
          {step !== 1 && (
            <>
              <div className="relative flex justify-center items-center">
                <IconBancor className="absolute w-24 text-primary" />
                <div className="absolute w-[60px] h-[60px] border border-grey-1 rounded-full" />
                <div className="w-[60px] h-[60px] border-t border-r border-primary rounded-full animate-spin" />
              </div>
              <h1 className="text-center mt-20">
                <div>{steps[step]}</div>
              </h1>
            </>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center text-12">
              <div className="flex justify-center items-center w-[52px] h-[52px] bg-primary rounded-full mb-14">
                <IconLock className="w-[22px] text-white" />
              </div>
              <h2 className="text-20 font-semibold mb-8">
                Approve {fromToken.symbol}
              </h2>
              <p className="text-center text-grey-5">
                Before you can proceed, you need to approve {fromToken.symbol}{' '}
                spending.
              </p>
              <button
                onClick={() => approveToken()}
                className={'btn-primary w-full my-15'}
              >
                Approve
              </button>
              <p className="text-center text-grey-5">
                Want to approve before each transaction?
              </p>
              <button
                onClick={() => approveToken(fromAmount)}
                className="underline"
              >
                Approve limited permission
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

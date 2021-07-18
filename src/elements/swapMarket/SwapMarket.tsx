import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { TokenListItem } from 'services/observables/tokens';
import { useContext, useEffect, useState } from 'react';
import { getPriceImpact, getRate, swap } from 'services/web3/swap/methods';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { useDispatch } from 'react-redux';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { useWeb3React } from '@web3-react/core';
import { Toggle } from 'elements/swapWidget/SwapWidget';
import { getNetworkContractApproval } from 'services/web3/approval';
import { prettifyNumber } from 'utils/helperFunctions';
import { ethToken, wethToken } from 'services/web3/config';
import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';
import { openWalletModal } from 'redux/user/user';
import { ModalApprove } from 'elements/modalApprove/modalApprove';
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
  const { chainId, account } = useWeb3React();
  const [fromAmount, setFromAmount] = useState('');
  const [fromDebounce, setFromDebounce] = useDebounce('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState('');
  const [priceImpact, setPriceImpact] = useState('');
  const [fromError, setFromError] = useState('');
  const toggle = useContext(Toggle);
  const [showModal, setShowModal] = useState(false);
  const [disableSwap, setDisableSwap] = useState(false);
  const dispatch = useDispatch();

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
          const baseRate = await getRate(fromToken, toToken, '1');
          setRate(baseRate);

          const priceImpact = await getPriceImpact(fromToken, toToken, '1');
          setPriceImpact(priceImpact.toFixed(4));
        } else if (fromToken && toToken) {
          const result = await getRate(fromToken, toToken, fromDebounce);
          const rate = (Number(result) / fromDebounce).toString();
          setToAmount(
            (
              (fromDebounce /
                (fromToken.usdPrice && toggle
                  ? Number(fromToken.usdPrice)
                  : 1)) *
              Number(rate) *
              (toToken.usdPrice && toggle ? Number(toToken.usdPrice) : 1)
            ).toFixed(2)
          );
          setRate(rate);

          const priceImpact = await getPriceImpact(
            fromToken,
            toToken,
            fromDebounce
          );
          setPriceImpact(priceImpact.toFixed(4));
        }
      })();
    }
  }, [fromToken, toToken, setToToken, fromDebounce, toggle, tokens]);

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
        net: chainId,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        user: account,
        onConfirmation,
      });
      console.log('txHash', txHash);

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

  const onConfirmation = (hashj: string) => {
    setDisableSwap(false);
    console.log('Refresh balances');
  };

  const steps = [
    'Checking allowance ...',
    'Choose approval',
    'Setting approval amount ...',
    'Processing Swap ...',
  ];

  // handle input errors
  useEffect(() => {
    const isZeroInput = new BigNumber(fromAmount).eq(0);
    if (isZeroInput) return setFromError('Alert: No Zero allowed');
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
              onClick={() =>
                fromToken.address !== wethToken ? switchTokens() : {}
              }
            />
          </div>
          <div className="mx-10 mb-16 pt-16">
            <TokenInputField
              label="You Receive"
              token={toToken}
              setToken={setToToken}
              input={toAmount}
              setInput={setToAmount}
              disabled
              selectable={fromToken && fromToken.address !== wethToken}
              startEmpty
              excludedTokens={[fromToken && fromToken.address, wethToken]}
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
            disabled={fromError !== '' || disableSwap}
          >
            Swap
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

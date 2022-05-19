import { Button } from 'components/button/Button';
import { TradeWidgetInput } from 'elements/trade/TradeWidgetInput';
import { useTradeWidget } from 'elements/trade/useTradeWidget';
import { useState } from 'react';
import { Token } from 'services/observables/tokens';
import { useSearchParams } from 'react-router-dom';
import { useNavigation } from 'hooks/useNavigation';
import {
  getFutureTime,
  prettifyNumber,
  toBigNumber,
} from 'utils/helperFunctions';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { ethToken } from 'services/web3/config';
import { expandToken } from 'utils/formulas';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import dayjs from 'utils/dayjs';
import { calculateMinimumReturn } from 'services/web3/swap/market';
import { useAppSelector } from 'store/index';
import { useApproveModal } from 'hooks/useApproveModal';

interface Props {
  from?: string;
  to?: string;
  tokens: Token[];
}

export const TradeWidget = ({ from, to, tokens }: Props) => {
  const { fromInput, toInput, isLoading } = useTradeWidget({
    from,
    to,
    tokens,
  });
  const slippageTolerance = useAppSelector(
    (state) => state.user.slippageTolerance
  );
  const account = useAppSelector((state) => state.user.account);

  const [isBusy, setIsBusy] = useState(false);
  const [tradeType, setTradeType] = useState<'byTarget' | 'bySource'>(
    'bySource'
  );

  const [searchParams] = useSearchParams();
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

  return (
    <div className="w-full md:min-w-[485px]">
      <div className="px-10 mb-[34px]">
        <TradeWidgetInput
          label={'You pay'}
          tokens={tokens}
          input={fromInput}
          onFocus={() => setTradeType('bySource')}
          onTokenSelect={(token: Token) => {
            goToPage.tradeBeta(
              {
                from: token.address,
                to: searchParams.get('to') ?? undefined,
              },
              true
            );
          }}
          isLoading={
            (isLoading && tradeType === 'byTarget') || toInput?.isTyping
          }
        />
      </div>
      <div className="bg-secondary p-10 rounded-30 pt-30 relative">
        <button
          onClick={() =>
            goToPage.tradeBeta(
              {
                from: searchParams.get('to') ?? undefined,
                to: searchParams.get('from') ?? undefined,
              },
              true
            )
          }
          className="transform hover:rotate-180 transition duration-500 rounded-full border-2 border-fog bg-white w-40 h-40 flex items-center justify-center absolute top-[-20px] left-[32px]"
        >
          <IconSync className="w-[25px] text-primary dark:text-primary-light" />
        </button>
        <TradeWidgetInput
          label={'You receive'}
          tokens={tokens}
          input={toInput}
          onTokenSelect={(token: Token) => {
            goToPage.tradeBeta(
              {
                from: searchParams.get('from') ?? undefined,
                to: token.address,
              },
              true
            );
          }}
          onFocus={() => setTradeType('byTarget')}
          isLoading={
            (isLoading && tradeType === 'bySource') || fromInput?.isTyping
          }
        />
        {fromInput && toInput && fromInput.inputTkn !== '' && (
          <div className="px-10 mt-10">
            <div className="flex justify-between">
              <div>Rate</div>
              {isLoading || fromInput.isTyping || toInput.isTyping ? (
                <div className="loading-skeleton h-10 w-[180px] bg-white" />
              ) : (
                <div>
                  1 {fromInput?.token.symbol} ={' '}
                  {prettifyNumber(
                    toBigNumber(toInput.inputTkn ?? 0).div(
                      fromInput.inputTkn ?? 0
                    )
                  )}{' '}
                  {toInput?.token.symbol}
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <div>Price Impact</div>
              <div>1 {fromInput.token.symbol}</div>
            </div>
          </div>
        )}

        <Button
          className="w-full mt-10"
          onClick={handleCTAClick}
          disabled={!toBigNumber(fromInput?.inputTkn ?? 0).gt(0) || isBusy}
        >
          {!toBigNumber(fromInput?.inputTkn ?? 0).gt(0)
            ? 'Enter Amount'
            : 'Trade'}
        </Button>
      </div>
      {ApproveModal}
    </div>
  );
};

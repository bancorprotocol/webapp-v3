import { Page } from 'components/Page';
import { TradeWidget } from 'elements/trade/TradeWidget';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from 'store/index';
import { ethToken } from 'services/web3/config';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { useEffect } from 'react';
import { useNavigation } from 'hooks/useNavigation';

export const Trade = () => {
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const tokens = useAppSelector((state) => state.bancor.tokens);

  const { goToPage } = useNavigation();

  useEffect(() => {
    if (!from && !to) {
      goToPage.tradeBeta({ from: ethToken, to }, true);
    }
  }, [from, goToPage, to]);

  return (
    <Page>
      <div className="flex justify-center mt-[-20px]">
        <div className="content-block p-10 rounded-40">
          <div className="flex items-center justify-between mr-10 ml-20 mt-10">
            <h2 className="text-[22px]">Trade</h2>
            <SwapSwitch />
          </div>
          <hr className="border-1 border-fog my-20 -mx-10" />
          <TradeWidget from={from} to={to} tokens={tokens} />
        </div>
      </div>
    </Page>
  );
};

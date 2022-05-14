import { Page } from 'components/Page';
import { TradeWidget } from 'elements/trade/TradeWidget';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from 'store/index';
import { getV3Tokens } from 'store/bancor/token';
import { ethToken } from 'services/web3/config';

export const Trade = () => {
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') ?? ethToken;
  const to = searchParams.get('to') ?? undefined;

  const tokens = useAppSelector(getV3Tokens);

  return (
    <Page>
      <div className="flex justify-center">
        <div className="content-block p-10 rounded-40">
          <TradeWidget from={from} to={to} tokens={tokens} />
        </div>
      </div>
    </Page>
  );
};

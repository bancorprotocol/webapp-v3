import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { useMemo, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  ApyVisionData,
  ExternalHolding,
  fetchExternalHoldings,
  getExternalHoldingsNonUni,
  getExternalHoldingsUni,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';
import { useAsyncEffect } from 'use-async-effect';
import { useWeb3React } from '@web3-react/core';

export const V3ExternalHoldings = () => {
  const { account } = useWeb3React();
  const [apyVisionData, setApyVisionData] = useState<ApyVisionData>({
    positionsUni: [],
    positionsNonUni: [],
  });

  const allTokens: Token[] = useAppSelector((state) => state.bancor.tokens);
  const tokensMap = useMemo(
    () => new Map(allTokens.map((token) => [token.symbol, token])),
    [allTokens]
  );

  const positionsUni: ExternalHolding[] = useMemo(
    () => getExternalHoldingsUni(apyVisionData.positionsUni, tokensMap),
    [apyVisionData.positionsUni, tokensMap]
  );

  const positionsNonUni: ExternalHolding[] = useMemo(
    () => getExternalHoldingsNonUni(apyVisionData.positionsNonUni, tokensMap),
    [apyVisionData.positionsNonUni, tokensMap]
  );

  const positions: ExternalHolding[] = useMemo(
    () => [...positionsUni, ...positionsNonUni],
    [positionsUni, positionsNonUni]
  );

  useAsyncEffect(async () => {
    if (!account) {
      return;
    }
    const apyVisionData = await fetchExternalHoldings(account);
    setApyVisionData(apyVisionData);
  }, [account]);

  return (
    <section className="content-block">
      <div>
        {positions.map((pos, i) => (
          <div key={i}>
            <h2>{pos.ammName}</h2>
            {pos.tokens.map((token) => (
              <div key={token.symbol}>Token: {token.symbol}</div>
            ))}
            <div>USD: {prettifyNumber(pos.usdValue, true)}</div>
            <div>Rekt Status: {pos.rektStatus}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

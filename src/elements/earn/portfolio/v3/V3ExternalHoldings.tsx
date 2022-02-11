import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  ExternalHoldingPosition,
  getExternalHoldingsNonUni,
  getExternalHoldingsUni,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';

export const V3ExternalHoldings = () => {
  const allTokens: Token[] = useAppSelector((state) => state.bancor.tokens);

  const tokensMap = useMemo(
    () => new Map(allTokens.map((token) => [token.symbol, token])),
    [allTokens]
  );

  const positionsUni: ExternalHoldingPosition[] = useMemo(
    () => getExternalHoldingsUni(tokensMap),
    [tokensMap]
  );

  const positionsNonUni: ExternalHoldingPosition[] = useMemo(
    () => getExternalHoldingsNonUni(tokensMap),
    [tokensMap]
  );

  const positions = useMemo(
    () => [...positionsUni, ...positionsNonUni],
    [positionsUni, positionsNonUni]
  );

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

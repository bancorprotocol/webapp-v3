import { useWeb3React } from '@web3-react/core';
import { useMemo, useState } from 'react';
import {
  ApyVisionData,
  ExternalHolding,
  fetchExternalHoldings,
  getExternalHoldingsNonUni,
  getExternalHoldingsUni,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { useAsyncEffect } from 'use-async-effect';

export const useExternalHoldings = () => {
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

  return { positions };
};
